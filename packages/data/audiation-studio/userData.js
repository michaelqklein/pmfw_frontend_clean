// This defines 4 objecct classes
// UserData, login_credentials, feature_access, high_score
// userData has three attributes
// 1. login_credentials
// 2. a list of feature_access objects
// 3. a list of high_scores. 
// UserData.js

class login_credentials {
    #user_ID;
    #First_Name;
    #Last_Name;
    #email;
    #password;
  
    constructor(user_ID, First_Name, Last_Name, email, password) {
      this.#user_ID = user_ID;
      this.#First_Name = First_Name;
      this.#Last_Name = Last_Name;
      this.#email = email;
      this.#password = password;
    }
  
    getFirstName() {
      return this.#First_Name;
    }
    getUserID(){
      return this.#user_ID;
    }
    getUserEmail(){
      return this.#email;
    }
  
  
    // Add other getters if needed
  }
  
  class high_score{
    #percent;
    #date;
    #time;
    #level;
  
    constructor(percent, date, time, level){
      this.#percent = percent;
      this.#date = date;
      this.#time = time;
      this.#level = level;
    }
    getPercent() {return this.#percent; }
    getDate() {return this.#date; }
    getTime() {return this.#time; }
    getLevel() {return this.#level; }
  }
  
  class user_setting {
    #task;
    #keyboard_selection;
    #tonality;
    #range;
    #duration;
    #communication;
    #reference;
    #repeat;
  
    constructor(task, keyboard_selection, tonality, range, duration, communication, reference, repeat) {
    this.#task = task;
    this.#keyboard_selection = keyboard_selection;
    this.#tonality = tonality;
    this.#range = range;
    this.#duration = duration;
    this.#communication = communication;
    this.#reference = reference;
    this.#repeat = repeat;
  }
    setTask(task){this.#task = task}
    setKeyboardSelection(keyboard_selection){this.#keyboard_selection = keyboard_selection}
    setTonality(tonality){this.#tonality = tonality}
    setRange(range){this.#range = range}
    setDuration(duration){this.#duration = duration}
    setCommunication(communication){this.#communication = communication}
    setReference(reference){this.#reference = reference}
    setRepeat(repeat){this.#repeat = repeat}
    
    getTask(){return this.#task}
    getKeyboardSelection(){return this.#keyboard_selection}
    getTonality(){return this.#tonality}
    getRange(){return this.#range}
    getDuration(){return this.#duration}
    getCommunication(){return this.#communication}
    getReference(){return this.#reference}
    getRepeat(){return this.#repeat}
  }
  
  
  class user_feature_access {
    #access_ID;
    #feature_name;
    #access_until;
    #amount_paid;
    #is_subscribed;
  
    constructor(feature_name, access_until, amount_paid, is_subscribed) {
      this.#feature_name = feature_name;
      this.#access_until = access_until;
      this.#amount_paid = amount_paid;
      this.#is_subscribed = is_subscribed;
    }
    getFeatureName() { return this.#feature_name }
    getAccessUntil() { 
      const accessUntilDate = new Date(this.#access_until);
      return accessUntilDate.toLocaleDateString();}
  }
  
  // Mother Data Class userData encapsulates all user data
  class userData {
    #loginCredentials;
    #feature_access;
    #user_settings;
    #highscores;
  
    constructor(loginCredentials, feature_access = [], user_settings = null, highscores = []) {
      if (!(loginCredentials instanceof login_credentials)) {
        throw new Error("loginCredentials must be an instance of login_credentials");
      }
      this.#loginCredentials = loginCredentials;
      this.#feature_access = feature_access;
      this.#user_settings = user_settings
      this.#highscores = highscores;
    }
  
    getUserID() {return this.#loginCredentials.getUserID(); }
    getUserEmail() {return this.#loginCredentials.getUserEmail(); }
    getFirstName() {return this.#loginCredentials.getFirstName(); }
    getFeatureName() { return this.#feature_access.getFeatureName(); }
    getAccessUntil() { return this.#feature_access.getAccessUntil(); }
  
    getLoginCredentials() {
      return this.#loginCredentials;
    }
  
    getFeatureAccess() {
      return this.#feature_access;
    }
  
    getHighScores() {
      return this.#highscores;
    }
  
    setFeatureAccess(feature_access) {
      this.#feature_access = feature_access;
    }
  
    setHighScores(highscores) {
      this.#highscores = highscores;
    }
  }
  
  export { login_credentials, high_score, user_setting, user_feature_access, userData };
  