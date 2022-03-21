<template>

  <v-container>
    
    <v-row class="text-center">
      <v-col cols="12">

        <label class="file-select2" style="max-width: 100%">
          <div class="select-button">
            <h3 v-if="selectedFile">Selected File(.zip): {{ selectedFile.name.substring(0, 30) + '...' }}</h3>
            <h3 v-else>Select a Zip File</h3>
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
            Select File
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
    <p>SELLECT FILE EXTENTIONS YOU WOULD LIKE TO EXAMINE</p>

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


        <br />

        <div style="text-align: center">
          <v-btn
            :loading="isLoading"
            :disabled="isLoading"
            color="blue-grey"
            class="ma-2 white--text"
            @click="submit"
          >
            Submit
            <v-icon right dark> mdi-cloud-upload </v-icon>
          </v-btn>
        </div>
        <div v-if="done" style="text-align: center">
          <h2>You have ({{ count }}) lines of code in this project</h2>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
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
    extString: ""
    }),

    methods: {
      onFileSelected(e) {
      this.selectedFile = e.target.files[0];
      if (this.selectedFile.size > 10485760) {
          console.log("File too big")
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
          this.done = false
          formData = new FormData();
          console.log(this.extString)
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

            this.count = response.data.codeLines
            this.done = true;
            console.log(response.data)
            this.isLoading = false;
            this.selectedFile = null
            this.extString = ""
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
          this.selectedFile = null
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
</style>
