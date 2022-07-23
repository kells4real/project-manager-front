<template>

  <v-container>
    
    <v-row class="text-center">
      <v-col cols="12">

        <label class="file-select2" style="max-width: 100%">
          <div class="select-button">
            <h3 v-if="selectedFile">Selected File (.zip): {{ selectedFile.name.substring(0, 30) + '...' }}</h3>
            <h3 v-else>Select Project Zipped File</h3>
          </div>
          <input
          ref="file" 
          style="display: none"
            type="file"
            color="accent"
            class="ma-2 white--text"
            accept=".zip,.7zip"
            @change="onFileSelected"
          />
          <br />
        </label>
        
        <div style="text-align: center">
          <v-btn
            color="blue-grey"
            class="ma-2 white--text"
            @click="$refs.file.click()"
          >
            Select A Zipped File
            <v-icon right dark> mdi-file </v-icon>
          </v-btn>
        </div>
        <br />
        <v-progress-linear
          v-if="selectedFile"
          v-model="uploadProgress"
          height="25"
          color="accent"
        >
          <strong v-if="uploadProgress == 100"
            >{{ uploadProgress }}% Waiting on server! Hold on.</strong
          >
          <strong v-else>{{ uploadProgress }}%</strong>
        </v-progress-linear>
 <v-card flat>

    <v-card-text>
      <v-container fluid>

    <p style="font-weight: bold">SELECT THE FILE TYPE(S) YOU WOULD LIKE TO TRACK</p>

        <v-row>
          <v-col
            cols="12"
            sm="4"
            md="4"
          >
             <v-checkbox
      v-model="selected"
      label="PYHTON"
      value=".py"
    ></v-checkbox>
    <v-checkbox
      v-model="selected"
      label="JSON"
      value=".json"
    ></v-checkbox>
          <v-checkbox
      v-model="selected"
      label="JAVA"
      value=".java"
    ></v-checkbox>
    <v-checkbox
      v-model="selected"
      label="JAVASCRIPT"
      value=".js"
    ></v-checkbox>
       <v-checkbox
      v-model="selected"
      label="GO"
      value=".go"
    ></v-checkbox>
          </v-col>
          <v-col
            cols="12"
            sm="4"
            md="4"
          >
          <v-checkbox
      v-model="selected"
      label="HTML"
      value=".html"
    ></v-checkbox>
       <v-checkbox
      v-model="selected"
      label="CSS"
      value=".css"
    ></v-checkbox>
    <v-checkbox
      v-model="selected"
      label="SCSS"
      value=".scss"
    ></v-checkbox>
      <v-checkbox
      v-model="selected"
      label="VUE"
      value=".vue"
    ></v-checkbox>
       <v-checkbox
      v-model="selected"
      label="TEXT"
      value=".txt"
    ></v-checkbox>
          </v-col>          
          <v-col
            cols="12"
            sm="4"
            md="4"
          >
      <v-checkbox
      v-model="selected"
      label="RUBY"
      value=".rb"
    ></v-checkbox>
          <v-checkbox
      v-model="selected"
      label="PHP"
      value=".php"
    ></v-checkbox>
             <v-checkbox
      v-model="selected"
      label="EJS"
      value=".ejs"
    ></v-checkbox>
          <v-checkbox
      v-model="selected"
      label="TYPESCRIPT"
      value=".tsx,.ts"
    ></v-checkbox>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>

        <div style="text-align:center; display: inline-block;">
          <vue-recaptcha
            ref="visibleRecaptcha"
            @verify="onVerify"
            @expired="onExpired"
            size="visible"
            sitekey="6Lf6QhQhAAAAAOX_N_GsoV-x39Y5T2QJQ09dyMwu">
          </vue-recaptcha>
        </div>

        <div style="text-align: center">
          <v-btn
            :loading="isLoading"
            :disabled="isLoading || !recaptcha"
            color="blue-grey"
            class="ma-2 white--text"
            @click="submit"
          >
            Submit
            <v-icon right dark> mdi-cloud-upload </v-icon>
          </v-btn>
        </div>

         <v-card v-if="done"
    class="mx-auto"
    max-width="344"
  >
    <v-card-text>
      <div>Total Lines</div>
      <p class="text-h5 text--primary">
        {{ count }}
      </p>
      <p>Lines of code</p>
      <div class="text--primary">
        Total lines of code in your project<br>
        based on the extensions you specified.
      </div>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn
        text
        color="primary"
        @click="reveal = true"
      >
        More Info
      </v-btn>
    </v-card-actions>

    <v-expand-transition>
      <v-card
        v-if="reveal"
        class="transition-fast-in-fast-out v-card--reveal"
        style="height: auto;"
      >
        <v-card-text class="pb-0">
          <p class="text-h5 text--primary">
            Details
          </p>
          <p style="font-weight: bold" v-for="item in summary" :key="item.name">
          {{item.name}}({{item.files}}) : {{item.lines}} {{item.lines > 1 ? 'lines': 'line'}} of code. </p>
        </v-card-text>
        <v-card-actions class="pt-0 justify-center">
          <v-btn
            text
            color="primary"
            @click="reveal = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-card>
        <br />
        <!-- <div style="text-align: center">
        <v-card elevation="2" class="mx-auto"
    max-width="344">
          <div v-for="item in summary" :key="item.name">

          </div>
          <h2 style="font-style: italics">Project has ({{ count }}) lines of code.</h2>
          </v-card>
        </div> -->
      </v-col>
      <v-snackbar
      v-model="snackBar"
      :timeout="7000"
    >
      {{ text }}
    </v-snackbar>
    </v-row>
  </v-container>
</template>

<script>
import VueRecaptcha from 'vue-recaptcha';
const axios = require('../axios')
  export default {
    name: 'HelloWorld',

    data: () => ({
    selectedFile: null,
    hash_tags: "",
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
    text: ""
    }),
       components: {
    VueRecaptcha
  },
    methods: {
   onSubmit: function () {
      this.$refs.visibleRecaptcha.execute()
    },
    onVerify: function (response) {
      console.log('Verify: ' + response)
      this.recaptcha = true;
    },
    onExpired: function () {
      console.log('Expired')
      this.recaptcha = false;
    },
    resetRecaptcha () {
      this.$refs.recaptcha.reset() // Direct call reset method
      this.recaptcha = false;
      
    },
      onFileSelected(e) {
        this.uploadProgress = 0
      this.selectedFile = e.target.files[0];
      if (this.selectedFile.size > 50485760) {
          this.text = "File can't be larger than 50MB"
          this.snackBar = true
        this.selectedFile = null;
      }
    },
    async submit(){
        let formData;
        this.uploadProgress = 0
        if (this.selectedFile && this.selected.length >= 1) {
          let i;
          for(i of this.selected){
            this.extString += i+","
          }
          this.isLoading = true
          this.done = false
          formData = new FormData();

          // formData.append("thumbnail", this.selectedImage, this.selectedImage.name);
          formData.append("projectName", "project");
          formData.append("file", this.selectedFile, this.selectedFile.name);
          formData.append("fileExt", this.extString);

          try {
            const response = await axios.post("/api/", formData, {
              onUploadProgress: function (uploadEvent) {
                this.uploadProgress = Math.round(
                  (uploadEvent.loaded / uploadEvent.total) * 100
                );
              }.bind(this),
            });
            console.log(response.data)
            this.count = response.data.codeLines
            this.summary = response.data.summary
            this.done = true;
            this.isLoading = false;
            this.selectedFile = null
            this.extString = ""
            this.recaptcha = false
          } catch (e) {
           console.log(e)
            this.done = false
            this.isLoading = false;
            this.selectedFile = null
            this.extString = ""

          }
        } else {
          this.done = false
          this.isLoading = false;
          this.text = "Make sure you've selected a file and at least one extention to lookup!"
          this.snackBar = true;
          // this.selectedFile = null
            this.extString = ""

        }
      
    }
    }
  }
</script>
<style scoped>
input[type=file]:focus {
  background-color: #ffd969;
  border-color: #000;
}
.v-card--reveal {
  bottom: 0;
  opacity: 1 !important;
  position: absolute;
  width: 100%;
}

</style>
