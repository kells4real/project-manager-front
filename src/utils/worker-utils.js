// utils/worker-utils.js
export function createCodeAnalyzerWorker() {
  const workerCode = `
// Simple analysis worker
const COMMENT_PATTERNS = {
  '.js': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.ts': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.py': /#.*$/g,
  '.java': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.html': /<!--[\\s\\S]*?-->/g,
  '.css': /\\/\\*[\\s\\S]*?\\*\\//g,
  '.vue': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\/|<!--[\\s\\S]*?-->/g,
  '.php': /\\/\\/.*$|#.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.rb': /#.*$/g,
  '.go': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.sh': /#.*$/g,
  '.sql': /--.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.cpp': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.c': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.cs': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.rs': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.swift': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.kt': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.scss': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.sass': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g,
  '.json': /\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\//g
};

self.onmessage = function(event) {
  const { type, data } = event.data;
  
  if (type === 'analyze') {
    try {
      // Debug logging
      self.postMessage({
        type: 'debug',
        message: 'Worker received analysis request'
      });
      
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

function analyzeFiles(files, selectedTypes, options) {
  // Send debug info
  self.postMessage({
    type: 'debug',
    message: 'Worker starting analysis of ' + files.length + ' files'
  });
  
  const results = {
    totalLines: 0,
    totalFilesProcessed: 0,
    fileTypeSummary: {},
    allFiles: []
  };
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const extension = getFileExtension(file.name);
    
    // Send file processing debug
    if (i % 20 === 0) {
      self.postMessage({
        type: 'debug',
        message: 'Processing file ' + (i + 1) + ' of ' + files.length + ': ' + file.name
      });
    }
    
    // Check if file type should be analyzed
    const shouldAnalyze = selectedTypes.some(type => {
      if (type.startsWith('.')) {
        return extension === type;
      }
      // Also check if filename contains the type (for special files)
      return file.name.includes(type);
    });
    
    if (shouldAnalyze && file.content) {
      const lines = countLines(file.content, options, extension);
      
      results.totalLines += lines;
      results.totalFilesProcessed++;
      
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
    
    // Send progress update
    if (i % 10 === 0) {
      self.postMessage({
        type: 'progress',
        progress: Math.round((i / files.length) * 100),
        currentFile: file.name,
        processedFiles: i + 1,
        totalFiles: files.length
      });
    }
  }
  
  // Send completion debug
  self.postMessage({
    type: 'debug',
    message: 'Analysis complete: ' + results.totalFilesProcessed + ' files processed, ' + results.totalLines + ' total lines'
  });
  
  // Convert to arrays and sort
  results.fileTypeSummary = Object.values(results.fileTypeSummary);
  results.fileTypeSummary.sort((a, b) => b.lines - a.lines);
  results.allFiles.sort((a, b) => b.lines - a.lines);
  
  return results;
}

function getFileExtension(filename) {
  if (!filename.includes('.')) {
    const specialFiles = ['Dockerfile', 'Makefile', '.gitignore', 'docker-compose.yml'];
    for (const special of specialFiles) {
      if (filename.includes(special)) return special;
    }
    return '';
  }
  return '.' + filename.split('.').pop().toLowerCase();
}

function countLines(content, options, extension) {
  let lines = content.split('\\n');
  
  // Remove comments if enabled
  if (options.ignoreComments) {
    const pattern = COMMENT_PATTERNS[extension];
    if (pattern) {
      content = content.replace(pattern, '');
      lines = content.split('\\n');
    }
  }
  
  // Filter empty lines if not counting them
  if (!options.countEmptyLines) {
    lines = lines.filter(line => line.trim().length > 0);
  }
  
  return lines.length;
}
`;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}