export type Severity = 'error' | 'warn';

export interface RepoRule {
    id: string;
    description: string;
    severity: Severity;
    autofix: boolean;
    scope?: string[];
}

export const RulesRegistry: Record<string, RepoRule> = {
    NAMING_FOLDER_CAPITALIZED: {
        id: 'NAMING_FOLDER_CAPITALIZED',
        description: 'Folder names must be TitleCase/CapitalizedWords.',
        severity: 'error',
        autofix: false, // Renaming folders is dangerous for imports
    },
    FILE_NO_SPACES: {
        id: 'FILE_NO_SPACES',
        description: 'Filenames must not contain spaces.',
        severity: 'error',
        autofix: true,
    },
    FILE_LOWERCASE_ALPHANUM: {
        id: 'FILE_LOWERCASE_ALPHANUM',
        description: 'Filenames must use lowercase letters, numbers, underscores, or dashes.',
        severity: 'error',
        autofix: true,
    },
    FILE_LENGTH_LIMIT: {
        id: 'FILE_LENGTH_LIMIT',
        description: 'Base filename must be 50 characters or less.',
        severity: 'warn',
        autofix: false,
    },
    DATE_PREFIX_FORMAT: {
        id: 'DATE_PREFIX_FORMAT',
        description: 'Content files must use yyyy-mm-dd_ prefix.',
        severity: 'error',
        autofix: true,
    },
    PDF_MAX_SIZE: {
        id: 'PDF_MAX_SIZE',
        description: 'PDF files must be smaller than 20MB.',
        severity: 'warn',
        autofix: false,
    },
    PDF_REQUIRE_OCR: {
        id: 'PDF_REQUIRE_OCR',
        description: 'PDF files should have a text layer (OCR).',
        severity: 'warn',
        autofix: false,
    }
};
