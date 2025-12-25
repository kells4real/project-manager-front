<template>
  <v-container class="d-flex justify-center">
    <v-row class="justify-center">
      <v-col cols="12" md="10" lg="8" xl="6">
        <!-- Upload Card -->
        <v-card
          outlined
          :class="{'drop-zone-dark': $vuetify.theme.dark, 'drop-zone-light': !$vuetify.theme.dark}"
          class="drop-zone text-center"
          elevation="2"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <v-card-text class="pa-6">
            <v-icon x-large color="primary" class="mb-4">mdi-cloud-upload-outline</v-icon>
            
            <div 
              class="drop-content"
              :class="{'drop-active': isDragging, 'has-file': hasSelectedFile}"
              @click="browseFiles"
            >
              <div v-if="!hasSelectedFile">
                <h3 class="text-h5 font-weight-medium mb-2">
                  Drag & Drop your project folder or zip file
                </h3>
                <p class="text-caption text--secondary">
                  Supports folders, .zip, .7zip (Max 50MB)
                </p>
                <div class="d-flex justify-center mt-4">
                  <v-btn
                    color="primary"
                    outlined
                    rounded
                    @click.stop="browseFiles"
                    class="mr-2"
                  >
                    <v-icon left>mdi-file-zip</v-icon>
                    Zip File
                  </v-btn>
                  <v-btn
                    color="secondary"
                    outlined
                    rounded
                    @click.stop="browseFolder"
                  >
                    <v-icon left>mdi-folder</v-icon>
                    Folder
                  </v-btn>
                </div>
              </div>
              
              <div v-else class="file-info">
                <v-icon large color="primary" class="mb-2">mdi-file-check-outline</v-icon>
                <h3 class="text-h6 font-weight-medium">
                  {{ selectedFile ? selectedFile.name : 'Folder with ' + selectedFolder.length + ' files' }}
                </h3>
                <p class="text-caption text--secondary">
                  <span v-if="selectedFile">{{ formatFileSize(selectedFile.size) }}</span>
                  <span v-else>{{ selectedFolder.length }} items selected</span>
                </p>
                <v-btn
                  small
                  color="error"
                  text
                  @click.stop="cancelUpload"
                  class="mt-2"
                >
                  <v-icon left small>mdi-close</v-icon>
                  Clear
                </v-btn>
              </div>
            </div>
          </v-card-text>
          
          <input
            ref="file"
            style="display: none"
            type="file"
            accept=".zip,.7z,.tar.gz"
            @change="onFileSelected"
          />
          
          <input
            ref="folder"
            style="display: none"
            type="file"
            webkitdirectory
            directory
            multiple
            @change="onFolderSelected"
          />
        </v-card>

        <!-- Processing State -->
        <v-expand-transition>
          <div v-if="isProcessing" class="mt-6">
            <v-card elevation="2" class="pa-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-subtitle-2">Analyzing code...</span>
                <v-chip small color="primary" dark>
                  {{ Math.round(progress) }}%
                </v-chip>
              </div>
              
              <v-progress-linear
                :value="progress"
                height="12"
                color="primary"
                striped
                rounded
                class="mb-3"
              ></v-progress-linear>
              
              <div class="d-flex justify-space-between text-caption text--secondary">
                <span>{{ processedFiles }} of {{ totalFiles }} files</span>
                <span class="text-truncate pl-2" style="max-width: 60%;">
                  <v-icon x-small class="mr-1">mdi-file</v-icon>
                  {{ currentFile }}
                </span>
              </div>
              
              <div class="text-center mt-3">
                <v-btn
                  small
                  color="error"
                  outlined
                  @click="cancelAnalysis"
                  :disabled="!worker"
                >
                  <v-icon left small>mdi-stop</v-icon>
                  Cancel Analysis
                </v-btn>
              </div>
            </v-card>
          </div>
        </v-expand-transition>

        <!-- File Type Selection -->
        <v-card flat class="mt-8" elevation="2" :disabled="isProcessing">
          <v-card-title class="justify-center py-4">
            <span class="primary--text" style="font-weight: bolder; font-size: medium;">
              SELECT FILE TYPES TO ANALYZE
            </span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="px-4">
            <v-container fluid class="px-0">
              <v-row dense>
                <v-col
                  v-for="(type, index) in fileTypes"
                  :key="index"
                  cols="6"
                  sm="4"
                  md="3"
                >
                  <v-checkbox
                    v-model="selectedTypes"
                    :label="type.label"
                    :value="type.value"
                    dense
                    hide-details
                    color="primary"
                    class="mt-0"
                    :disabled="isProcessing"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-btn 
              small 
              @click="selectAll" 
              text 
              color="primary"
              :disabled="isProcessing"
            >
              Select All
            </v-btn>
            <v-btn 
              small 
              @click="deselectAll" 
              text 
              color="secondary"
              :disabled="isProcessing"
            >
              Deselect All
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Analysis Options -->
        <v-card flat class="mt-4" elevation="2" :disabled="isProcessing">
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="countEmptyLines"
                  label="Count empty lines"
                  color="primary"
                  hide-details
                  :disabled="isProcessing"
                ></v-switch>
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="ignoreComments"
                  label="Ignore comments"
                  color="primary"
                  hide-details
                  :disabled="isProcessing"
                ></v-switch>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Analyze Button -->
        <div class="text-center mt-8">
          <v-btn
            :loading="isProcessing"
            :disabled="!hasSelectedFile || selectedTypes.length === 0 || isProcessing"
            color="primary"
            large
            rounded
            depressed
            @click="analyzeCode"
            class="px-8"
          >
            <v-icon left>mdi-magnify-scan</v-icon>
            {{ isProcessing ? 'Analyzing...' : 'Analyze Code' }}
          </v-btn>
        </div>

        <!-- Results -->
        <v-expand-transition>
          <div v-if="analysisComplete" class="mt-8">
            <!-- Summary -->
            <v-card class="mb-4" elevation="2">
              <v-card-title class="justify-center primary white--text py-4">
                <v-icon left color="white">mdi-file-chart-outline</v-icon>
                ANALYSIS COMPLETE
              </v-card-title>
              <v-card-text class="text-center pt-6 pb-4">
                <div class="text-h3 primary--text font-weight-bold">
                  {{ totalLines.toLocaleString() }}
                </div>
                <div class="text-subtitle-1 text--secondary">Total lines of code</div>
                
                <v-row class="mt-4">
                  <v-col cols="6">
                    <div class="text-h5">{{ totalFilesProcessed }}</div>
                    <div class="text-caption text--secondary">Files Analyzed</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-h5">{{ processingTime }}s</div>
                    <div class="text-caption text--secondary">Processing Time</div>
                  </v-col>
                </v-row>
                
                <v-chip color="success" class="mt-4" dark>
                  <v-icon left small>mdi-check</v-icon>
                  Analysis completed in background thread
                </v-chip>
              </v-card-text>
            </v-card>

            <!-- Detailed Results -->
            <v-card elevation="2">
              <v-tabs v-model="activeTab" centered grow>
                <v-tab>
                  <v-icon left small>mdi-format-list-bulleted-type</v-icon>
                  By Type
                </v-tab>
                <v-tab>
                  <v-icon left small>mdi-sort</v-icon>
                  Largest Files
                </v-tab>
                <v-tab>
                  <v-icon left small>mdi-chart-bar</v-icon>
                  Statistics
                </v-tab>
              </v-tabs>

              <v-tabs-items v-model="activeTab">
                <!-- File Type View -->
                <v-tab-item>
                  <v-card-text>
                    <v-data-table
                      :headers="typeHeaders"
                      :items="fileTypeSummary"
                      :items-per-page="10"
                      class="elevation-1"
                      hide-default-footer
                    >
                      <template v-slot:item.type="{ item }">
                        <v-chip x-small color="primary" dark class="mr-2">
                          {{ getExtensionIcon(item.type) }}
                        </v-chip>
                        {{ getFileTypeLabel(item.type) }}
                      </template>
                      <template v-slot:item.lines="{ item }">
                        <span class="font-weight-medium">
                          {{ item.lines.toLocaleString() }}
                        </span>
                      </template>
                      <template v-slot:item.percentage="{ item }">
                        <v-progress-linear
                          :value="(item.lines / totalLines) * 100"
                          height="8"
                          color="primary"
                          rounded
                        ></v-progress-linear>
                        <span class="text-caption ml-2">
                          {{ ((item.lines / totalLines) * 100).toFixed(1) }}%
                        </span>
                      </template>
                    </v-data-table>
                  </v-card-text>
                </v-tab-item>

                <!-- Largest Files View -->
                <v-tab-item>
                  <v-card-text>
                    <v-list two-line>
                      <v-list-item
                        v-for="(file, index) in largestFiles.slice(0, 15)"
                        :key="file.name"
                      >
                        <v-list-item-avatar>
                          <v-avatar :color="getRankColor(index)" size="40">
                            <span class="white--text font-weight-bold">{{ index + 1 }}</span>
                          </v-avatar>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title class="font-weight-medium">
                            {{ file.name.split('/').pop() }}
                            <v-chip x-small class="ml-2" color="grey lighten-2">
                              {{ getFileExtension(file.name) }}
                            </v-chip>
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            <span class="mr-3">
                              <v-icon x-small class="mr-1">mdi-text</v-icon>
                              {{ file.lines.toLocaleString() }} lines
                            </span>
                            <span>
                              <v-icon x-small class="mr-1">mdi-file</v-icon>
                              {{ formatFileSize(file.size) }}
                            </span>
                          </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-chip small :color="getRankColor(index)" dark>
                            #{{ index + 1 }}
                          </v-chip>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-tab-item>

                <!-- Statistics View -->
                <v-tab-item>
                  <v-card-text>
                    <v-row class="mb-4">
                      <v-col v-for="stat in statistics" :key="stat.title" cols="6" md="3">
                        <v-card elevation="1" class="text-center pa-3">
                          <div class="text-h5 font-weight-bold primary--text">
                            {{ stat.value }}
                          </div>
                          <div class="text-caption text--secondary mt-1">
                            {{ stat.title }}
                          </div>
                        </v-card>
                      </v-col>
                    </v-row>
                    
                    <v-card elevation="1" class="pa-4">
                      <div class="text-subtitle-1 font-weight-medium mb-2">
                        File Size Distribution
                      </div>
                      <div class="d-flex align-center mb-1" v-for="range in sizeRanges" :key="range.label">
                        <span class="text-caption mr-2" style="min-width: 80px;">
                          {{ range.label }}
                        </span>
                        <v-progress-linear
                          :value="(range.count / totalFilesProcessed) * 100"
                          height="10"
                          :color="range.color"
                          rounded
                        ></v-progress-linear>
                        <span class="text-caption ml-2" style="min-width: 40px;">
                          {{ range.count }} ({{ ((range.count / totalFilesProcessed) * 100).toFixed(1) }}%)
                        </span>
                      </div>
                    </v-card>
                  </v-card-text>
                </v-tab-item>
              </v-tabs-items>

              <!-- Actions -->
              <v-card-actions class="justify-center pa-4">
                <v-btn @click="exportResults" color="primary" outlined>
                  <v-icon left>mdi-download</v-icon>
                  Export JSON
                </v-btn>
                <v-btn @click="exportCSV" color="secondary" outlined class="ml-2">
                  <v-icon left>mdi-file-excel</v-icon>
                  Export CSV
                </v-btn>
                <v-btn @click="startNewAnalysis" color="success" outlined class="ml-2">
                  <v-icon left>mdi-refresh</v-icon>
                  New Analysis
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </v-expand-transition>

        <!-- Error Snackbar -->
        <v-snackbar v-model="showError" :timeout="5000" color="error" top>
          {{ errorMessage }}
          <template v-slot:action="{ attrs }">
            <v-btn icon v-bind="attrs" @click="showError = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import JSZip from 'jszip';
import { createCodeAnalyzerWorker } from '@/utils/worker-utils';

export default {
  name: 'CodeAnalyzer',
  
  data() {
    return {
      selectedFile: null,
      selectedFolder: null,
      isProcessing: false,
      isDragging: false,
      
      // Progress
      progress: 0,
      currentFile: '',
      processedFiles: 0,
      totalFiles: 0,
      processingTime: 0, // ADDED THIS
      startTime: null,   // ADDED THIS
      
      // Settings
      selectedTypes: [],
      countEmptyLines: false,
      ignoreComments: true,
      
      // Results
      analysisComplete: false,
      totalLines: 0,
      totalFilesProcessed: 0,
      fileTypeSummary: [],
      largestFiles: [],
      allFiles: [],
      
      // UI
      activeTab: 0,
      showError: false,
      errorMessage: '',
      showSuccess: false,
      successMessage: '',
      
      // Worker
      worker: null,
      
      // Table headers - ADDED THIS
      typeHeaders: [
        { text: 'File Type', value: 'type', align: 'left' },
        { text: 'Files', value: 'count', align: 'center' },
        { text: 'Lines', value: 'lines', align: 'center' },
        { text: 'Percentage', value: 'percentage', align: 'center', sortable: false }
      ],
      
      // File types
      fileTypes: [
        { label: "Python (.py)", value: ".py" },
        { label: "JavaScript (.js)", value: ".js" },
        { label: "TypeScript (.ts)", value: ".ts" },
        { label: "HTML (.html)", value: ".html" },
        { label: "CSS (.css)", value: ".css" },
        { label: "SCSS (.scss)", value: ".scss" },
        { label: "Vue (.vue)", value: ".vue" },
        { label: "Java (.java)", value: ".java" },
        { label: "C/C++ (.c/.cpp)", value: ".c" },
        { label: "C# (.cs)", value: ".cs" },
        { label: "Go (.go)", value: ".go" },
        { label: "PHP (.php)", value: ".php" },
        { label: "Ruby (.rb)", value: ".rb" },
        { label: "JSON (.json)", value: ".json" },
        { label: "YAML (.yaml)", value: ".yaml" },
        { label: "XML (.xml)", value: ".xml" },
        { label: "Markdown (.md)", value: ".md" },
        { label: "Text (.txt)", value: ".txt" },
        { label: "Shell (.sh)", value: ".sh" },
        { label: "Dockerfile", value: "Dockerfile" },
        { label: "Makefile", value: "Makefile" }
      ]
    };
  },
  
  computed: {
    hasSelectedFile() {
      return this.selectedFile || (this.selectedFolder && this.selectedFolder.length > 0);
    },
    
    statistics() {
      const avgLines = this.totalFilesProcessed > 0 
        ? Math.round(this.totalLines / this.totalFilesProcessed) 
        : 0;
      
      const maxLines = this.largestFiles.length > 0 
        ? this.largestFiles[0].lines 
        : 0;
      
      const minLines = this.allFiles.length > 0 
        ? Math.min(...this.allFiles.map(f => f.lines)) 
        : 0;
      
      const totalSize = this.allFiles.reduce((sum, file) => sum + (file.size || 0), 0);
      
      return [
        { title: 'Avg Lines/File', value: avgLines.toLocaleString() },
        { title: 'Largest File', value: maxLines.toLocaleString() },
        { title: 'Smallest File', value: minLines.toLocaleString() },
        { title: 'Total Size', value: this.formatFileSize(totalSize) }
      ];
    },
    
    sizeRanges() {
      const ranges = [
        { label: 'Tiny (< 10 lines)', max: 10, color: 'blue', count: 0 },
        { label: 'Small (10-100)', max: 100, color: 'green', count: 0 },
        { label: 'Medium (100-500)', max: 500, color: 'yellow', count: 0 },
        { label: 'Large (500-1000)', max: 1000, color: 'orange', count: 0 },
        { label: 'Huge (> 1000)', max: Infinity, color: 'red', count: 0 }
      ];
      
      this.allFiles.forEach(file => {
        for (const range of ranges) {
          if (file.lines < range.max) {
            range.count++;
            break;
          }
        }
      });
      
      return ranges;
    }
  },
  
  methods: {
    // File handling
    browseFiles() {
      this.$refs.file.click();
    },
    
    browseFolder() {
      this.$refs.folder.click();
    },
    
    onFileSelected(e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 50 * 1024 * 1024) {
          this.showErrorMsg("File size must be less than 50MB");
          return;
        }
        this.selectedFile = file;
        this.selectedFolder = null;
        this.analysisComplete = false;
        this.resetFileInputs();
      }
    },
    
    onFolderSelected(e) {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > 50 * 1024 * 1024) {
          this.showErrorMsg("Total folder size must be less than 50MB");
          return;
        }
        this.selectedFolder = files;
        this.selectedFile = null;
        this.analysisComplete = false;
        this.resetFileInputs();
      }
    },
    
    handleDrop(e) {
      e.preventDefault();
      this.isDragging = false;
      const items = e.dataTransfer.items;
      console.log('Dropped items:', items);
      const files = Array.from(e.dataTransfer.files || []);
      
      if (files.length > 0) {
        const zipFile = files.find(f => 
          f.name.match(/\.(zip|7z|tar\.gz)$/i)
        );
        
        if (zipFile && files.length === 1) {
          if (zipFile.size > 50 * 1024 * 1024) {
            this.showErrorMsg("File size must be less than 50MB");
            return;
          }
          this.selectedFile = zipFile;
          this.selectedFolder = null;
        } else {
          const totalSize = files.reduce((sum, file) => sum + file.size, 0);
          if (totalSize > 50 * 1024 * 1024) {
            this.showErrorMsg("Total size must be less than 50MB");
            return;
          }
          this.selectedFolder = files;
          this.selectedFile = null;
        }
        this.analysisComplete = false;
      }
    },
    
    resetFileInputs() {
      if (this.$refs.file) this.$refs.file.value = '';
      if (this.$refs.folder) this.$refs.folder.value = '';
    },
    
    cancelUpload() {
      this.selectedFile = null;
      this.selectedFolder = null;
      this.analysisComplete = false;
      this.resetFileInputs();
    },
    
    // Selection helpers
    selectAll() {
      this.selectedTypes = this.fileTypes.map(type => type.value);
    },
    
    deselectAll() {
      this.selectedTypes = [];
    },
    
    // Main analysis method
    async analyzeCode() {
      if (!this.hasSelectedFile || this.selectedTypes.length === 0) {
        this.showErrorMsg("Please select files and file types first");
        return;
      }
      
      // Reset state
      this.isProcessing = true;
      this.progress = 0;
      this.currentFile = '';
      this.processedFiles = 0;
      this.totalFiles = 0;
      this.analysisComplete = false;
      this.totalLines = 0;
      this.totalFilesProcessed = 0;
      this.fileTypeSummary = [];
      this.largestFiles = [];
      this.allFiles = [];
      this.processingTime = 0; // Reset processing time
      this.startTime = Date.now(); // Record start time
      
      try {
        // Step 1: Extract/read files in main thread
        this.currentFile = 'Preparing files...';
        const files = await this.extractAndReadFiles();
        
        if (files.length === 0) {
          throw new Error('No valid files found to analyze');
        }
        
        // Step 2: Create worker and analyze
        this.createWorker();
        
        const workerData = {
          files: files,
          selectedTypes: this.selectedTypes,
          options: {
            countEmptyLines: this.countEmptyLines,
            ignoreComments: this.ignoreComments
          }
        };
        
        this.worker.postMessage({
          type: 'analyze',
          data: workerData
        });
        
      } catch (error) {
        console.error('Error in analysis:', error);
        this.showErrorMsg('Failed to analyze files: ' + error.message);
        this.isProcessing = false;
        this.cleanupWorker();
      }
    },
    
    // Extract and read files
    async extractAndReadFiles() {
      const files = [];
      
      if (this.selectedFile) {
        if (this.selectedFile.name.match(/\.(zip|7z|tar\.gz)$/i)) {
          await this.extractZipFile(this.selectedFile, files);
        } else {
          // Single non-zip file
          const content = await this.readFileAsText(this.selectedFile);
          files.push({
            name: this.selectedFile.name,
            content: content,
            size: this.selectedFile.size
          });
        }
      } else if (this.selectedFolder) {
        await this.processFolder(this.selectedFolder, files);
      }
      
      this.totalFiles = files.length;
      return files;
    },
    
    // Fixed: Extract zip file
    async extractZipFile(zipFile, filesArray) {
      try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(zipFile);
        
        const entries = Object.keys(zipData.files);
        let extractedCount = 0;
        
        for (const filename of entries) {
          const zipEntry = zipData.files[filename];
          
          if (!zipEntry.dir) {
            try {
              const content = await zipEntry.async('text');
              filesArray.push({
                name: filename,
                content: content,
                size: content.length
              });
              extractedCount++;
              
              // Update progress
              if (extractedCount % 10 === 0) {
                this.currentFile = 'Extracted ' + extractedCount + ' files...';
                await this.$nextTick();
              }
            } catch (e) {
              // Skip binary files
              console.log('Skipping binary file:', filename);
            }
          }
        }
        
        this.currentFile = 'Extracted ' + extractedCount + ' files';
        
      } catch (error) {
        throw new Error('Failed to extract zip file: ' + error.message);
      }
    },
    
    // Process folder
    async processFolder(folderItems, filesArray) {
      const textFiles = Array.from(folderItems).filter(item => 
        !item.type || 
        item.type.startsWith('text/') || 
        /\.(js|ts|py|java|c|cpp|cs|html|css|scss|vue|php|rb|go|json|yaml|xml|md|txt|sh)$/i.test(item.name)
      );
      
      let processedCount = 0;
      
      for (const file of textFiles) {
        try {
          const content = await this.readFileAsText(file);
          filesArray.push({
            name: file.webkitRelativePath || file.name,
            content: content,
            size: file.size
          });
          processedCount++;
          
          // Update progress
          if (processedCount % 10 === 0) {
            this.currentFile = 'Read ' + processedCount + ' files...';
            await this.$nextTick();
          }
        } catch (e) {
          console.log('Could not read file:', file.name);
        }
      }
      
      this.currentFile = 'Processed ' + processedCount + ' files';
    },
    
    // Read file as text
    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
    },
    
    // Create worker
    createWorker() {
      this.worker = createCodeAnalyzerWorker();
      
      this.worker.onmessage = (event) => {
        const { type, progress, currentFile, processedFiles, totalFiles, results, error } = event.data;
        
        switch (type) {
          case 'progress':
            this.progress = progress;
            this.currentFile = currentFile || '';
            if (processedFiles !== undefined) this.processedFiles = processedFiles;
            if (totalFiles !== undefined) this.totalFiles = totalFiles;
            break;
            
          case 'complete':
            // Calculate processing time
            if (this.startTime) {
              this.processingTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
            }
            
            this.processResults(results);
            this.analysisComplete = true;
            this.isProcessing = false;
            this.showSuccessMsg('Analysis completed successfully!');
            this.cleanupWorker();
            break;
            
          case 'error':
            this.showErrorMsg(error || 'Worker encountered an error');
            this.isProcessing = false;
            this.cleanupWorker();
            break;
        }
      };
      
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.showErrorMsg('Worker failed to execute');
        this.isProcessing = false;
        this.cleanupWorker();
      };
    },
    
    // Clean up worker
    cleanupWorker() {
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }
    },
    
    // Process results
    processResults(results) {
      this.totalLines = results.totalLines || 0;
      this.totalFilesProcessed = results.totalFilesProcessed || 0;
      this.fileTypeSummary = results.fileTypeSummary || [];
      this.allFiles = results.allFiles || [];
      this.largestFiles = (results.allFiles || []).slice(0, 20);
      
      // Add percentage property to fileTypeSummary for the table
      this.fileTypeSummary = this.fileTypeSummary.map(item => {
        return {
          ...item,
          percentage: this.totalLines > 0 ? ((item.lines / this.totalLines) * 100).toFixed(1) : 0
        };
      });
    },
    
    // Cancel analysis
    cancelAnalysis() {
      if (this.worker) {
        this.cleanupWorker();
        this.isProcessing = false;
        this.showErrorMsg('Analysis cancelled');
      }
    },
    
    // UI helpers
    showErrorMsg(message) {
      this.errorMessage = message;
      this.showError = true;
    },
    
    showSuccessMsg(message) {
      this.successMessage = message;
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 3000);
    },
    
    // Utility methods
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },
    
    getFileTypeLabel(extension) {
      const type = this.fileTypes.find(t => t.value === extension);
      return type ? type.label.replace(/\(.*\)/, '').trim() : extension;
    },
    
    getExtensionIcon(extension) {
      if (extension === '.js') return 'JS';
      if (extension === '.ts') return 'TS';
      if (extension === '.py') return 'PY';
      if (extension === '.java') return 'JV';
      if (extension === '.vue') return 'VUE';
      if (extension === '.html') return 'HTML';
      if (extension === '.css') return 'CSS';
      if (extension === '.json') return 'JSON';
      if (extension === '.md') return 'MD';
      if (extension === '.sh') return 'SH';
      if (extension === 'Dockerfile') return 'DF';
      if (extension === 'Makefile') return 'MF';
      return extension.substring(1, 3).toUpperCase();
    },
    
    // Add missing methods from template
    getRankColor(index) {
      if (index === 0) return 'gold darken-1';
      if (index === 1) return 'grey darken-1';
      if (index === 2) return 'orange darken-3';
      const colors = ['primary', 'secondary', 'success', 'info', 'warning'];
      return colors[index % colors.length];
    },
    
    getColorByIndex(index) {
      const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
      return colors[index % colors.length];
    },
    
    getFileExtension(filename) {
      const lastDot = filename.lastIndexOf('.');
      if (lastDot === -1) {
        if (filename === 'Dockerfile' || filename === 'Makefile' || filename === '.gitignore') {
          return filename;
        }
        return '';
      }
      return filename.substring(lastDot).toLowerCase();
    },
    
    // Export methods - ADDED exportCSV
    exportResults() {
      const results = {
        timestamp: new Date().toISOString(),
        summary: {
          totalLines: this.totalLines,
          totalFiles: this.totalFilesProcessed,
          fileTypes: this.fileTypeSummary.length,
          processingTime: this.processingTime
        },
        byFileType: this.fileTypeSummary,
        largestFiles: this.largestFiles,
        settings: {
          countEmptyLines: this.countEmptyLines,
          ignoreComments: this.ignoreComments,
          selectedFileTypes: this.selectedTypes
        }
      };
      
      const dataStr = JSON.stringify(results, null, 2);
      this.downloadFile(dataStr, 'code-analysis.json', 'application/json');
    },
    
    // ADDED THIS METHOD
    exportCSV() {
      let csv = 'File Type,Files,Lines,Percentage\n';
      
      this.fileTypeSummary.forEach(item => {
        const percentage = this.totalLines > 0 ? ((item.lines / this.totalLines) * 100).toFixed(2) : '0';
        csv += `"${this.getFileTypeLabel(item.type)}",${item.count},${item.lines},${percentage}%\n`;
      });
      
      csv += '\n\nTop Files\n';
      csv += 'Rank,File Name,Lines,Size\n';
      
      this.largestFiles.slice(0, 10).forEach((file, index) => {
        csv += `${index + 1},"${file.name}",${file.lines},"${this.formatFileSize(file.size)}"\n`;
      });
      
      this.downloadFile(csv, 'code-analysis.csv', 'text/csv');
    },
    
    downloadFile(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    
    startNewAnalysis() {
      this.cleanupWorker();
      this.selectedFile = null;
      this.selectedFolder = null;
      this.selectedTypes = [];
      this.analysisComplete = false;
      this.totalLines = 0;
      this.totalFilesProcessed = 0;
      this.fileTypeSummary = [];
      this.largestFiles = [];
      this.allFiles = [];
      this.processingTime = 0;
      this.resetFileInputs();
    },
    
    beforeDestroy() {
      this.cleanupWorker();
    }
  }
};
</script>
<style scoped>
/* Keep your existing styles */
.drop-zone {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.drop-zone-light {
  background-color: #FAFAFA;
  border-color: #e0e0e0;
}

.drop-zone-dark {
  background-color: #1E1E1E;
  border-color: #424242;
}

.drop-content {
  padding: 30px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.drop-content:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

.drop-active {
  border-color: #1976d2 !important;
  background-color: rgba(25, 118, 210, 0.08) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.has-file {
  background-color: rgba(76, 175, 80, 0.04);
  border-color: #4caf50 !important;
}

.file-info {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>