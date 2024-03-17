
import DBManager from "./storageManager.mjs";

/*  
// If you dont want to use class, this is one alternative

const User = function () {
  return {
    email: "",
    password: "",
    username: "",
    id: null,
    save: Save,
  };

  function Save() {
    console.log(this.username);
  }
};

}*/


class User {

  constructor() {
    ///TODO: Are these the correct fields for your project?
    this.email;
    this.password;
    this.username;
    this.id;
  }

  async save() {
    try {
      if (this.id == null) {
        const result = await DBManager.createUser(this);
        // Optionally, update the user's id with the returned value (if not already done inside createUser)
        this.id = result.id; 
        return result;
      } else {
        return await DBManager.updateUser(this);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      throw error; // Re-throw the error if you want the caller to handle it
    }
  }

  async delete() {
    try {
      if (this.id != null) {
        const result = await DBManager.deleteUser(this.id);
        return result;
      } else {
        throw new Error("User does not have an ID, cannot delete.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}


export default User;