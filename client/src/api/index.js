// Centralized API exports for easy imports elsewhere in the app
export { apiClient, default as axiosClient } from './apiClient';

// Export all services as named exports so other modules can import from a single entry
export * from './hymnService';
export * from './uploadService';
export * from './tagService';
export * from './sayingService';
export * from './lyricService';
export * from './backupService';

// Provide a named `uploadService` export (convenience wrapper around default export)
import uploadServiceDefault from './uploadService';
export { uploadServiceDefault as uploadService };

// Note: prefer importing named services: `import { HymnService, TagService, LyricService, BackupService } from 'src/api'`
