
class Utilisateur {
  constructor (token,secrettoken,idaccount,ws) {
      console.log("CONNECTION")
      console.log("token:"+token)
      console.log("secrettoken:"+secrettoken)
      console.log("idaccount:"+idaccount)
      this.token = token
      this.secrettoken = secrettoken.split(" ").join("+");
      this.idaccount = idaccount
      this.ws = ws
  }

}
module.exports = {
  Utilisateur
}