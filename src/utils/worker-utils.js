// utils/worker-utils.js
export function createCodeAnalyzerWorker() {
  const workerCode = `
// Simple analysis worker - expects already extracted file contents

// Comment patterns (properly escaped for template string)
const COMMENT_PATTERNS = {
  '.js': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.ts': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.jsx': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.tsx': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.py': /#.*$/g,
  '.java': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.c': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.cpp': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.cs': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.php': /\\/\\/.*$|#.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.rb': /#.*$/g,
  '.go': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.rs': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.vue': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\/|<!--[\\s\\S]*?-->/g,
  '.html': /<!--[\\s\\S]*?-->/g,
  '.css': /\\/\\*[\\s\\S]*?\\*\\//g,
  '.scss': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.sass': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.swift': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.kt': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.sh': /#.*$/g,
  '.bash': /#.*$/g,
  '.yaml': /#.*$/g,
  '.yml': /#.*$/g,
  '.sql': /--.*$|\\/\\*[\\s\\S]*?\\*\\//g
};

// Get file extension
function getFileExtension(filename) {
  if (!filename.includes('.')) {
    // Special files
    const specialFiles = ['Dockerfile', 'Makefile', '.gitignore', 'docker-compose.yml'];
    for (const special of specialFiles) {
      if (filename.includes(special)) return special;
    }
    return '';
  }
  return '.' + filename.split('.').pop().toLowerCase();
}

// Remove comments from content
function removeComments(content, extension) {
  const pattern = COMMENT_PATTERNS[extension];
  if (pattern) {
    return content.replace(pattern, '');
  }
  return content;
}

// Count lines with options
function countLines(content, options, extension) {
  let lines = content.split('\\n');
  
  // Remove comments if enabled
  if (options.ignoreComments) {
    content = removeComments(content, extension);
    lines = content.split('\\n');
  }
  
  // Filter empty lines if not counting them
  if (!options.countEmptyLines) {
    lines = lines.filter(line => line.trim().length > 0);
  }
  
  return lines.length;
}

// Main analysis function
function analyzeFiles(files, selectedTypes, options) {
  const results = {
    totalLines: 0,
    totalFilesProcessed: 0,
    fileTypeSummary: {},
    allFiles: []
  };
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const extension = getFileExtension(file.name);
    
    // Check if this file type should be analyzed
    const shouldAnalyze = selectedTypes.some(type => {
      if (type.startsWith('.')) {
        return extension === type;
      }
      return file.name.includes(type);
    });
    
    if (shouldAnalyze && file.content) {
      const lines = countLines(file.content, options, extension);
      
      results.totalLines += lines;
      results.totalFilesProcessed++;
      
      // Add to all files list
      results.allFiles.push({
        name: file.name,
        lines: lines,
        size: file.size || file.content.length,
        extension: extension
      });
      
      // Update file type summary
      if (!results.fileTypeSummary[extension]) {
        results.fileTypeSummary[extension] = {
          type: extension,
          count: 0,
          lines: 0
        };
      }
      results.fileTypeSummary[extension].count++;
      results.fileTypeSummary[extension].lines += lines;
    }
    
    // Send progress update every 20 files
    if (i % 20 === 0) {
      self.postMessage({
        type: 'progress',
        progress: Math.round((i / files.length) * 100),
        currentFile: file.name,
        processedFiles: i + 1,
        totalFiles: files.length
      });
    }
  }
  
  // Convert to arrays and sort
  results.fileTypeSummary = Object.values(results.fileTypeSummary);
  results.fileTypeSummary.sort((a, b) => b.lines - a.lines);
  
  results.allFiles.sort((a, b) => b.lines - a.lines);
  
  return results;
}

// Handle messages from main thread
self.onmessage = function(event) {
  const { type, data } = event.data;
  
  if (type === 'analyze') {
    try {
      const results = analyzeFiles(data.files, data.selectedTypes, data.options);
      
      self.postMessage({
        type: 'complete',
        results: results
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error.message || 'Analysis failed'
      });
    }
  }
};
`;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}