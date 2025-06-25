<template>
  <v-container class="d-flex justify-center">
    <v-row class="justify-center">
      <v-col cols="12" md="10" lg="8" xl="6">
        <!-- Drag and drop zone -->
        <v-card
          outlined
          class="drop-zone text-center"
          :class="{ 'drop-zone-active': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          elevation="2"
        >
          <v-card-text class="pa-6">
            <v-icon x-large color="primary" class="mb-4">mdi-cloud-upload-outline</v-icon>
            <h3 class="text-h5 font-weight-medium mb-2">
              <span v-if="selectedFile">
                {{ selectedFile.name.substring(0, 30) + (selectedFile.name.length > 30 ? '...' : '') }}
              </span>
              <span v-else>Drag & Drop your project zip file</span>
            </h3>
            <p class="text-caption text--secondary mt-1 mb-3">
              <span v-if="!selectedFile">Supports .zip, .7zip (Max 50MB)</span>
              <span v-else>{{ formatFileSize(selectedFile.size) }}</span>
            </p>
            <v-btn
              color="primary"
              outlined
              rounded
              @click="$refs.file.click()"
              class="mt-2"
            >
              <v-icon left>mdi-folder-open-outline</v-icon>
              Browse Files
            </v-btn>
          </v-card-text>
          <input
            ref="file"
            style="display: none"
            type="file"
            accept=".zip,.7zip"
            @change="onFileSelected"
          />
        </v-card>

        <!-- Progress indicator -->
        <v-expand-transition>
          <div v-if="selectedFile" class="mt-4">
            <v-progress-linear
              v-model="uploadProgress"
              height="20"
              color="primary"
              striped
              :active="isLoading"
              rounded
            >
              <template v-slot:default="{ value }">
                <span class="text-caption white--text">
                  <span v-if="value == 100">Processing...</span>
                  <span v-else>Uploading {{ value }}%</span>
                </span>
              </template>
            </v-progress-linear>
            <div class="text-center mt-1">
              <v-btn
                v-if="!isLoading"
                small
                text
                color="grey darken-1"
                @click="cancelUpload"
              >
                Cancel
              </v-btn>
            </div>
          </div>
        </v-expand-transition>

        <!-- File type selection -->
        <v-card flat class="mt-8" elevation="2">
          <v-card-title class="justify-center py-4">
            <span class="primary--text" style="font-weight: bolder; font-size: medium;">SELECT FILE TYPES TO ANALYZE</span>
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
                    v-model="selected"
                    :label="type.label"
                    :value="type.value"
                    dense
                    hide-details
                    color="primary"
                    class="mt-0"
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>

        <!-- Recaptcha & Submit -->
        <div class="text-center mt-8">
          <div class="d-flex justify-center mb-4">
            <vue-recaptcha
              ref="visibleRecaptcha"
              @verify="onVerify"
              @expired="onExpired"
              size="normal"
              sitekey="6Ld4rG0rAAAAAHP0ZPTagS0NCTch_SvfUfF_bDaH"
            ></vue-recaptcha>
          </div>

          <v-btn
            :loading="isLoading"
            :disabled="isLoading || !recaptcha || !selectedFile || selected.length === 0"
            color="primary"
            large
            rounded
            depressed
            @click="submit"
            class="px-8"
          >
            <v-icon left>mdi-magnify-scan</v-icon>
            Analyze Project
          </v-btn>
        </div>

        <!-- Results card -->
        <v-expand-transition>
          <v-card v-if="done" class="mt-8 mx-auto" max-width="500" elevation="2">
            <v-card-title class="justify-center primary white--text py-4">
              <v-icon left color="white">mdi-file-chart-outline</v-icon>
              ANALYSIS RESULTS
            </v-card-title>
            <v-card-text class="text-center pt-6 pb-4">
              <div class="text-h3 primary--text font-weight-bold">{{ count.toLocaleString() }}</div>
              <div class="text-subtitle-1 text--secondary">Total lines of code</div>
              <v-chip small color="primary" text-color="white" class="mt-3">
                {{ selected.length }} file type{{ selected.length > 1 ? 's' : '' }} analyzed
              </v-chip>
            </v-card-text>
            
            <v-card-actions class="justify-center pb-4">
              <v-btn text color="primary" @click="reveal = !reveal">
                {{ reveal ? 'Hide Details' : 'Show Breakdown' }}
                <v-icon right>{{ reveal ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </v-card-actions>

            <v-expand-transition>
              <div v-if="reveal">
                <v-divider></v-divider>
                <v-card-text class="px-0">
                  <v-simple-table>
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left">File Type</th>
                          <th class="text-center">Files</th>
                          <th class="text-right">Lines</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in summary" :key="item.name">
                          <td class="text-left font-weight-medium">{{ item.name }}</td>
                          <td class="text-center">{{ item.files }}</td>
                          <td class="text-right">{{ item.lines.toLocaleString() }}</td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-expand-transition>

        <v-snackbar v-model="snackBar" :timeout="5000" color="error" top>
          {{ text }}
          <template v-slot:action="{ attrs }">
            <v-btn icon v-bind="attrs" @click="snackBar = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VueRecaptcha from 'vue-recaptcha';
const axios = require('../axios')

export default {
  name: 'CodeAnalyzer',

  data: () => ({
    selectedFile: null,
    isLoading: false,
    count: 0,
    uploadProgress: 0,
    done: false,
    selected: [],
    extString: "",
    snackBar: false,
    recaptcha: false,
    summary: [],
    reveal: false,
    text: "",
    isDragging: false,
    fileTypes: [
      { label: "Python", value: ".py" },
      { label: "JSON", value: ".json" },
      { label: "Java", value: ".java" },
      { label: "JavaScript", value: ".js" },
      { label: "Go", value: ".go" },
      { label: "HTML", value: ".html" },
      { label: "CSS", value: ".css" },
      { label: "SCSS", value: ".scss" },
      { label: "Vue", value: ".vue" },
      { label: "Text", value: ".txt" },
      { label: "Ruby", value: ".rb" },
      { label: "PHP", value: ".php" },
      { label: "EJS", value: ".ejs" },
      { label: "TypeScript", value: ".tsx,.ts" }
    ]
  }),

  components: {
    VueRecaptcha
  },

  methods: {
    onSubmit: function () {
      this.$refs.visibleRecaptcha.execute()
    },
    onVerify: function (response) {
      console.log("Recaptcha response:", response)
      this.recaptcha = true;
    },
    onExpired: function () {
      this.recaptcha = false;
    },
    resetRecaptcha() {
      this.$refs.recaptcha.reset()
      this.recaptcha = false;
    },
    onFileSelected(e) {
      this.handleFiles(e.target.files)
    },
    handleDrop(e) {
      this.isDragging = false
      this.handleFiles(e.dataTransfer.files)
    },
    handleFiles(files) {
      this.uploadProgress = 0
      if (files.length > 0) {
        this.selectedFile = files[0]
        if (this.selectedFile.size > 50485760) {
          this.showError("File can't be larger than 50MB")
          this.selectedFile = null
        }
      }
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    cancelUpload() {
      this.selectedFile = null
      this.uploadProgress = 0
      this.isLoading = false
    },
    showError(message) {
      this.text = message
      this.snackBar = true
    },
    async submit() {
      if (!this.selectedFile) {
        this.showError("Please select a file first")
        return
      }
      
      if (this.selected.length < 1) {
        this.showError("Please select at least one file type to analyze")
        return
      }

      this.uploadProgress = 0
      this.isLoading = true
      this.done = false
      
      const formData = new FormData()
      formData.append("projectName", "project")
      formData.append("file", this.selectedFile, this.selectedFile.name)
      formData.append("fileExt", this.selected.join(","))

      try {
        const response = await axios.post("/api/", formData, {
          onUploadProgress: (uploadEvent) => {
            this.uploadProgress = Math.round(
              (uploadEvent.loaded / uploadEvent.total) * 100
            )
          }
        })
        
        this.count = response.data.codeLines
        this.summary = response.data.summary
        this.done = true
      } catch (e) {
        console.error(e)
        this.showError("An error occurred during analysis. Please try again.")
      } finally {
        this.isLoading = false
        this.selectedFile = null
        this.extString = ""
        this.recaptcha = false
      }
    }
  }
}
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  background-color: #fafafa;
}

.drop-zone-active {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.04);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-card--reveal {
  bottom: 0;
  opacity: 1 !important;
  position: absolute;
  width: 100%;
}

.text-caption {
  color: rgba(0, 0, 0, 0.6);
}

/* Smooth transitions for all elements */
.v-enter-active, .v-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.v-enter, .v-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Table styling */
.v-data-table >>> thead th {
  font-weight: 600;
  letter-spacing: 0.5px;
}
.v-data-table >>> tbody tr:hover {
  background-color: #f5f5f5 !important;
}
</style>