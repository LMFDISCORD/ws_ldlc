const PORT = process.env.PORT || 3000;
const INDEX = 'index.html';
const { Utilisateur } = require('./class/utilisateur.js')
const express = require('express')
var req = require('request');
const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const { Server } = require('ws');


const wss = new Server({ server });


let utilisateurs = new Map()
wss.on("connection", (ws,Request) => {
    ws.binaryType = 'arraybuffer';
    console.log("test")
    let monUrl = new URL(Request.url, `http://${Request.headers.host}`);

    let token = monUrl.searchParams.get("token")
    let secrettoken = monUrl.searchParams.get("secrettoken").split(" ").join("+")
    let idaccount = monUrl.searchParams.get("idaccount")

    if(token==="" || secrettoken==="" || idaccount===""){
        ws.close()
    }else{
        req.get({url:"https://namel.lepeuplediscord.com/ldlc/ws/"+idaccount,headers:{token: token,secrettoken: secrettoken}},function (e, r, body){
            let monJson = JSON.parse(r.body)
            if(monJson.error){
              console.log("CONNECTION NOK :" + idaccount)
              ws.close()
            }else{

                ws.on("close",message =>{
                    console.log("CLOSE: " + idaccount)
                    utilisateurs.delete(idaccount)
                })

                ws.on("message",message =>{
                    traitementMessage(message.toString(),idaccount)
                })

                let pingInterval = setInterval(() => {
                    ws.ping()
                }, 3000);
                console.log("CONNECTION OK :" + idaccount)
                controleUtilisateurs = setInterval(() => {
                    if(utilisateurs.has(idaccount)){
                        let unUtilisateurSupp = utilisateurs.get(idaccount)
                        unUtilisateurSupp.ws.close()
                    }else{
                        clearInterval(controleUtilisateurs)
                        utilisateurs.set(idaccount,new Utilisateur(token,secrettoken,idaccount,ws))
                    }
                },200)
        }
    })  
    }
})

function traitementMessage(message,idaccount){
    let monMessage = JSON.parse(message)
    if(monMessage.messageId == 1){
        for(let unUtilisateur of utilisateurs){
            if(unUtilisateur.idaccount!=idaccount){
                unUtilisateur.ws.send(JSON.stringify(monMessage))
            }
        }
    }
}

verifInterval = setInterval(() => {
    utilisateurs.forEach(unUtilisateur => {
        req.get({url:"https://namel.lepeuplediscord.com/ldlc/ws/"+unUtilisateur.idaccount,headers:{token: unUtilisateur.token,secrettoken:unUtilisateur.secrettoken}},function (e, r, body){
            let monJson = JSON.parse(r.body)
            if(monJson.error){
              console.log("NOK :" + unUtilisateur.idaccount)
              unUtilisateur.ws.close()
            }else{console.log("OK :" + unUtilisateur.idaccount)}
        })  
    })
}, 5000)