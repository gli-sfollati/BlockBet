SignUp = {
    web3Provider: null,
    contracts: {},
  
  
    initWeb3: async function () {
      // Modern dapp browsers...
      if (window.ethereum) {
        SignUp.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.enable();
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        SignUp.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        SignUp.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(SignUp.web3Provider);
  
      return SignUp.initContract();
    },
  
    initContract: function () {
      $.getJSON('Roulette.json', function (data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var RouletteArtifact = data;
        SignUp.contracts.Roulette = TruffleContract(RouletteArtifact);
  
        // Set the provider for our contract
        SignUp.contracts.Roulette.setProvider(SignUp.web3Provider);
  
        //return SignUp.GetStatPlayer();
      });
      return SignUp.Verifica();
    },
  
    bindEvents: function () {
      $(document).on('click', '.btn-submit', SignUp.Registrati);
      $(document).on('click', '.btn-home', SignUp.Home);
  
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
  
    },
  
  
    //Restituisce tutte le statistiche dei giocatori 
    GetStatPlayer: async function () {
      var RouletteInstance;
      $.getJSON('Roulette.json', function (data) {
        var RouletteArtifact = data;
        SignUp.contracts.Roulette = TruffleContract(RouletteArtifact);
        SignUp.contracts.Roulette.setProvider(SignUp.web3Provider);
        SignUp.contracts.Roulette.deployed().then(async function (instance) {
  
          var nome = document.getElementById("nome");
          var indirizzo = document.getElementById("indirizzo");
          var massimaVincita = document.getElementById("massimaVincita");
          var soldiTotaliGiocati = document.getElementById("soldiTotaliGiocati");
          var scommesseVinte = document.getElementById("scommesseVinte");
          var scommesseiPazzate = document.getElementById("scommesseiPazzate");
          var soldiNelConto = document.getElementById("soldiNelConto");
  
          RouletteInstance = instance;
          var data = await RouletteInstance.getStatoUtente.call();
          if(data[5] == "0x0000000000000000000000000000000000000000"){
            var bttNome = document.getElementById("bottoneNome");
            bttNome.style.display = "none"
          }
  
          nome.innerHTML += data[0];
          soldiTotaliGiocati.innerHTML += data[3];
          scommesseVinte.innerHTML += 0; //da fare nel contratto
          scommesseiPazzate.innerHTML += data[1];
          soldiNelConto.innerHTML += data[4];
          massimaVincita.innerHTML += data[2];
          indirizzo.innerHTML += data[5];
  
          if(data[5] == "0x0000000000000000000000000000000000000000"){
            var btt = document.getElementById("bottoneRegistrati");
            var text1 = document.getElementById("text1")
            btt.style.display="inline"
            text1.style.display ="block"
          }
          return data;
        }).then(function (result) {
          console.log("è stato visualizzato tutto correttamente " + " nome: " + result[0] + " game: " + result[1] + "maxWin: " + result[2] + "totalcashlow: " + result[3] + " cash in bank: " + result[4] + " indirizzo" + result[5])
        });
      });
  
      return SignUp.bindEvents();
    },
  
  

    Home: async function (event) {
      event.preventDefault();
      window.location = "http://localhost:3000/index.html"; //modificare con la pagina di registrazione quando verrà creata 
      return SignUp.bindEvents();
    },

    //verifica se il player ha già un account 
    Verifica: function (){
      var RouletteInstance;
      $.getJSON('Roulette.json', function (data) {
        var RouletteArtifact = data;
        SignUp.contracts.Roulette = TruffleContract(RouletteArtifact);
        SignUp.contracts.Roulette.setProvider(SignUp.web3Provider);
  
        SignUp.contracts.Roulette.deployed().then(async function (instance) {
          RouletteInstance = instance;

          var accounts = await ethereum.request({ method: 'eth_accounts' });
          var data = await RouletteInstance.getStatoUtente.call({ from: accounts[0] });
          
          if(data[5] == accounts[0]){
            var bttNome = document.getElementById("bottoneSubmit");
            bttNome.style.display="none" ;
            console.log(data[5] + " " + accounts[0])
            return true;
          }
          else{
            console.log(data[5] + " " + accounts[0])
            return false;
          }
        }).then(function (result) {
            if(result == true){
                console.log("verifica completata");
            } else{
                console.log("errore nella verifica");
            }
        });
      });
      return SignUp.bindEvents();
    },
  
  
    Registrati:  function(event){

      var accounts =  ethereum.request({ method: 'eth_accounts' });
      console.log(accounts);
      event.preventDefault();
      var nome=document.getElementById("inputUsername").value;
          console.log(nome);
      
      var RouletteInstance;
      $.getJSON('Roulette.json', function (data) {
          var RouletteArtifact = data;
          SignUp.contracts.Roulette = TruffleContract(RouletteArtifact);
          SignUp.contracts.Roulette.setProvider(SignUp.web3Provider);


          SignUp.contracts.Roulette.deployed().then(async function (instance) {
            RouletteInstance = instance;
           

            var accounts = await ethereum.request({ method: 'eth_accounts' });

            var price =await RouletteInstance.getStato.call();
            var prezzo = price[1].toNumber();

            return  RouletteInstance.addPlayer( nome, {from: accounts[0], value: prezzo});
            

          }).then(function (result) {     
            console.log(result);
            window.location = "http://localhost:3000/Profile.html";
          });
      });
      
      return SignUp.bindEvents();
    }
  
  };
  
  $(function () {
    $(window).load(function () {
      SignUp.initWeb3();
    });
  });