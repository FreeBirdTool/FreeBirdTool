import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, 
  Image as ImageIcon, 
  Search, 
  ChevronRight, 
  RefreshCw, 
  X, 
  UploadCloud, 
  Check, 
  ExternalLink,
  HardDrive,
  Sparkles,
  ArrowLeft,
  Lock,
  AlertCircle
} from 'lucide-react';
import { 
  listDriveFiles, 
  downloadDriveImageAsUploadedImage, 
  uploadImageToDrive, 
  DriveFileItem, 
  formatBytes 
} from '../services/googleDriveService';
import { googleSignIn, logout, setAccessToken } from '../services/authService';
import { ConfirmationModal } from './ConfirmationModal';
import { UploadedImage } from '../types';
import { User } from 'firebase/auth';

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: 'product' | 'style' | 'save' | null;
  onImportImages?: (images: UploadedImage[], slot: 'product' | 'style') => void;
  currentGeneratedImage?: string | null;
  user: User | null;
  accessToken: string | null;
  onAuthChange: (user: User | null, token: string | null) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  targetSlot,
  onImportImages,
  currentGeneratedImage,
  user,
  accessToken,
  onAuthChange
}) => {
  // Navigation & Folder hierarchy
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'My Drive' }]);
  const currentFolder = breadcrumbs[breadcrumbs.length - 1];

  // Files state
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Save mode state
  const [saveFileName, setSaveFileName] = useState<string>('Studio_Shot_' + new Date().toISOString().slice(0, 10));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedFileResult, setSavedFileResult] = useState<DriveFileItem | null>(null);

  // Import state
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<string>('');

  // Confirmation dialog for Save to Drive operation
  const [showSaveConfirm, setShowSaveConfirm] = useState<boolean>(false);

  // Load files when folder or auth changes
  const loadFiles = useCallback(async (folderId: string, search = '') => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await listDriveFiles(accessToken, {
        folderId,
        searchTerm: search.trim(),
        onlyImages: true
      });
      setFiles(response.files || []);
    } catch (err: any) {
      console.error('Error fetching drive files:', err);
      setError(err.message || 'Failed to load files from Google Drive');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isOpen && accessToken) {
      loadFiles(currentFolder.id, searchTerm);
    }
  }, [isOpen, accessToken, currentFolder.id, loadFiles]);

  // Reset selection on folder navigation
  const handleNavigateFolder = (folderId: string, folderName: string) => {
    setSelectedFileIds(new Set());
    setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setSelectedFileIds(new Set());
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  const handleToggleSelect = (file: DriveFileItem) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      handleNavigateFolder(file.id, file.name);
      return;
    }

    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(file.id)) {
        next.delete(file.id);
      } else {
        next.add(file.id);
      }
      return next;
    });
  };

  // Sign In handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onAuthChange(result.user, result.accessToken);
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setAccessToken(null);
    onAuthChange(null, null);
    setFiles([]);
    setSelectedFileIds(new Set());
  };

  // Import selected files
  const handleImportSelected = async (slot: 'product' | 'style') => {
    if (!accessToken || selectedFileIds.size === 0 || !onImportImages) return;

    setIsImporting(true);
    setImportProgress(`Preparing ${selectedFileIds.size} asset(s)...`);
    try {
      const selectedFiles = files.filter(f => selectedFileIds.has(f.id));
      const imported: UploadedImage[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setImportProgress(`Downloading ${file.name} (${i + 1}/${selectedFiles.length})...`);
        const uploaded = await downloadDriveImageAsUploadedImage(accessToken, file);
        imported.push(uploaded);
      }

      onImportImages(imported, slot);
      onClose();
    } catch (err: any) {
      console.error('Import error:', err);
      setError('Failed to import images: ' + err.message);
    } finally {
      setIsImporting(false);
      setImportProgress('');
    }
  };

  // Save generated image to Drive
  const handleConfirmSaveToDrive = async () => {
    if (!accessToken || !currentGeneratedImage) return;

    setIsSaving(true);
    setShowSaveConfirm(false);
    setError(null);
    try {
      const targetFolderId = currentFolder.id === 'root' ? undefined : currentFolder.id;
      const uploadedResult = await uploadImageToDrive(
        accessToken,
        currentGeneratedImage,
        saveFileName,
        targetFolderId
      );
      setSavedFileResult(uploadedResult);
      // Refresh folder files
      loadFiles(currentFolder.id, searchTerm);
    } catch (err: any) {
      console.error('Save error:', err);
      setError('Failed to save to Google Drive: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-[#0c0d10] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Top Bar Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-white/15 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Google Drive Cloud Storage
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                    Workspace Connected
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {targetSlot === 'save'
                    ? 'Save generated visual asset directly to your Google Drive'
                    : 'Import product photography and style references from your Google Drive'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-[10px] flex items-center justify-center font-bold">
                      {user.email?.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[140px] truncate">{user.displayName || user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="ml-1 text-gray-500 hover:text-red-400 text-[10px] uppercase font-semibold transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!accessToken ? (
            /* Auth Required State */
            <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 text-blue-400">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Google Drive</h3>
              <p className="text-sm text-gray-400 max-w-md mb-8 leading-relaxed">
                Authenticate with Google to browse and import your product assets, or export your AI Studio generations directly to Drive.
              </p>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs max-w-md">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-white/10 flex items-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
            </div>
          ) : (
            /* Authenticated Explorer */
            <div className="flex-1 flex flex-col min-h-0">
              {/* Save Success Banner */}
              {savedFileResult && (
                <div className="m-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-emerald-200">
                        Visual Successfully Saved to Google Drive!
                      </div>
                      <div className="text-xs text-emerald-400/80">
                        {savedFileResult.name}
                      </div>
                    </div>
                  </div>
                  {savedFileResult.webViewLink && (
                    <a
                      href={savedFileResult.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open in Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Navigation & Search Bar */}
              <div className="p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 bg-white/[0.01]">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1 text-sm overflow-x-auto py-1">
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.id}>
                      {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />}
                      <button
                        onClick={() => handleBreadcrumbClick(idx)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                          idx === breadcrumbs.length - 1
                            ? 'text-white bg-white/10 font-semibold'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {idx === 0 ? 'My Drive' : crumb.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Drive images..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') loadFiles(currentFolder.id, searchTerm);
                      }}
                      className="w-48 sm:w-64 pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <button
                    onClick={() => loadFiles(currentFolder.id, searchTerm)}
                    disabled={isLoading}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
                    title="Refresh folder"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Error Notice with Auto-Recovery */}
              {error && (
                <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                  {(error.toLowerCase().includes('scope') || error.toLowerCase().includes('auth') || error.toLowerCase().includes('permission') || error.toLowerCase().includes('401') || error.toLowerCase().includes('403')) && (
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer"
                    >
                      Grant Drive Permissions
                    </button>
                  )}
                </div>
              )}

              {/* Files Grid View */}
              <div className="flex-1 overflow-y-auto p-4 min-h-[280px]">
                {isLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-400">Loading Google Drive contents...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 text-gray-500">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-medium text-gray-300 mb-1">No images or folders found</div>
                    <div className="text-xs text-gray-500 max-w-sm">
                      {searchTerm
                        ? `No image files matching "${searchTerm}" in this directory.`
                        : 'This Google Drive folder does not contain any image files.'}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {files.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      const isSelected = selectedFileIds.has(file.id);

                      return (
                        <div
                          key={file.id}
                          onClick={() => handleToggleSelect(file)}
                          className={`group relative rounded-xl border p-2 flex flex-col cursor-pointer transition-all duration-200 ${
                            isFolder
                              ? 'bg-[#15161b] hover:bg-[#1c1e24] border-white/5 hover:border-white/20'
                              : isSelected
                              ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500'
                              : 'bg-[#121316] hover:bg-[#18191f] border-white/5 hover:border-white/15'
                          }`}
                        >
                          {/* Folder / Image Thumbnail */}
                          <div className="relative aspect-video sm:aspect-square rounded-lg overflow-hidden bg-black/60 flex items-center justify-center mb-2">
                            {isFolder ? (
                              <Folder className="w-10 h-10 text-amber-400 group-hover:scale-110 transition-transform" />
                            ) : file.thumbnailLink ? (
                              <img
                                src={file.thumbnailLink}
                                alt={file.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-gray-500" />
                            )}

                            {/* Selection check indicator */}
                            {!isFolder && (
                              <div
                                className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-black/60 border-white/30 opacity-0 group-hover:opacity-100 text-transparent'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          {/* File info */}
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-gray-200 truncate group-hover:text-white" title={file.name}>
                              {file.name}
                            </div>
                            <div className="text-[10px] text-gray-500 flex items-center justify-between mt-0.5">
                              <span>{isFolder ? 'Folder' : formatBytes(file.size)}</span>
                              {file.modifiedTime && (
                                <span>{new Date(file.modifiedTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-4">
                {targetSlot === 'save' ? (
                  /* Save Visual to Drive Controls */
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-auto flex-1 flex items-center gap-3">
                      <div className="text-xs text-gray-400 whitespace-nowrap">File Name:</div>
                      <input
                        type="text"
                        value={saveFileName}
                        onChange={(e) => setSaveFileName(e.target.value)}
                        placeholder="Studio_Shot_Name"
                        className="flex-1 max-w-sm px-3 py-1.5 bg-black/40 border border-white/15 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-xs text-gray-500">.png</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowSaveConfirm(true)}
                        disabled={isSaving || !currentGeneratedImage}
                        className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        {isSaving ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <UploadCloud className="w-4 h-4" />
                        )}
                        <span>Save to Google Drive</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Import to Workspace Controls */
                  <div className="w-full flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      {selectedFileIds.size > 0 ? (
                        <span className="text-blue-400 font-semibold">
                          {selectedFileIds.size} image{selectedFileIds.size > 1 ? 's' : ''} selected
                        </span>
                      ) : (
                        'Select images to import into FreeBirdTool workspace'
                      )}
                      {importProgress && <span className="ml-2 text-white font-medium">({importProgress})</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={onClose}
                        disabled={isImporting}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        Cancel
                      </button>

                      {targetSlot === 'style' ? (
                        <button
                          onClick={() => handleImportSelected('style')}
                          disabled={isImporting || selectedFileIds.size === 0}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 flex items-center gap-1.5 transition-all disabled:opacity-40"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Import as Style Reference</span>
                        </button>
                      ) : targetSlot === 'product' ? (
                        <button
                          onClick={() => handleImportSelected('product')}
                          disabled={isImporting || selectedFileIds.size === 0}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30 flex items-center gap-1.5 transition-all disabled:opacity-40"
                        >
                          <HardDrive className="w-3.5 h-3.5" />
                          <span>Import as Product Shots</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleImportSelected('product')}
                            disabled={isImporting || selectedFileIds.size === 0}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30 transition-all disabled:opacity-40"
                          >
                            Import as Subject
                          </button>
                          <button
                            onClick={() => handleImportSelected('style')}
                            disabled={isImporting || selectedFileIds.size === 0}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-40"
                          >
                            Import as Style
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirmation Modal for Mutating / Writing data to Google Drive */}
      <ConfirmationModal
        isOpen={showSaveConfirm}
        title="Save Image to Google Drive?"
        description={`This will upload "${saveFileName}.png" to your Google Drive in the folder "${currentFolder.name}". You will be able to access and share it from your Google Drive anytime.`}
        confirmLabel="Save to Drive"
        cancelLabel="Cancel"
        isLoading={isSaving}
        onConfirm={handleConfirmSaveToDrive}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </>
  );
};
