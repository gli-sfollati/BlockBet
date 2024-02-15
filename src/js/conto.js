App = {
    web3Provider: null,
    contracts: {},

  
    initWeb3: async function() {
      // Modern dapp browsers...
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
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
        App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);
  
      return App.initContract();
    },
  
    initContract: function() {
      $.getJSON('Roulette.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var RouletteArtifact = data;
        App.contracts.Roulette = TruffleContract(RouletteArtifact);
  
        // Set the provider for our contract
        App.contracts.Roulette.setProvider(App.web3Provider);
  
        // Use our contract to retrieve and mark the adopted pets
        //return App.GetStatus();
      });
      return App.GetStatus();
    },

    bindEvents: function() {
      $(document).on('click', '.btn-deposit', App.Deposita);
      $(document).on('click', '.btn-preleva', App.CashOut);

      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })

    },
  
    
    GetStatus:async  function() {
      var RouletteInstance;
      var dato1 = document.getElementById("dato1");
      $.getJSON('Roulette.json', function (data) {
          var RouletteArtifact = data;
          App.contracts.Roulette = TruffleContract(RouletteArtifact);

          App.contracts.Roulette.setProvider(App.web3Provider);

          App.contracts.Roulette.deployed().then(async function (instance) {

            RouletteInstance = instance;
              var data =await RouletteInstance.getStato.call();
              //dato1.value=data[0];
              dato1.innerHTML=data[0];
              console.log("soldi totali ether: "+data[0]+" il prezzo è: "+ data[1]);
              return data;
          }).then(function (result) {
              
          });
      });
      
      return App.bindEvents();
    },


    Deposita: function(event){
      var accounts = ethereum.request({ method: 'eth_accounts' });
      console.log(accounts);
      event.preventDefault();
      
      var RouletteInstance;
      $.getJSON('Roulette.json', function (data) {
          var RouletteArtifact = data;
          App.contracts.Roulette = TruffleContract(RouletteArtifact);
          App.contracts.Roulette.setProvider(App.web3Provider);

          App.contracts.Roulette.deployed().then(async function (instance) {
            RouletteInstance = instance;

            var accounts = await ethereum.request({ method: 'eth_accounts' });
            var dep = document.getElementById("totDeposito").value;
            console.log(dep * 1000000000000000000);
            
            console.log("prima di some ether"+ (dep * 1000000000000000000), accounts, dep);
            await RouletteInstance.addEther({ from: accounts[0], value: (dep * 1000000000000000000) });
            

          }).then(function (result ) {     
            console.log(result);
            location.reload(true);
            window.location = "http://localhost:3000/profile.html";
          });
      });
      
      return App.GetStatus();
    },


    CashOut: function(event){

      var accounts = ethereum.request({ method: 'eth_accounts' });
      console.log(accounts);
      event.preventDefault();
      
      var RouletteInstance;
      $.getJSON('Roulette.json', function (data) {
          var RouletteArtifact = data;
          App.contracts.Roulette = TruffleContract(RouletteArtifact);
          App.contracts.Roulette.setProvider(App.web3Provider);

          App.contracts.Roulette.deployed().then(async function (instance) {
            RouletteInstance = instance;

            var accounts = await ethereum.request({ method: 'eth_accounts' });
            var  x=await RouletteInstance.getStatoUtente.call({ from: accounts[0] });
            var playerCash = data[4];
            var dep = document.getElementById("totCashOut").value;

            if(dep>playerCash){
              var btt = document.getElementById("buttonCashOut");
              btt.style.display="none";
              return false
            }
            await RouletteInstance.cashOut((dep * 1000000000000000000),{from: accounts[0]});


          }).then(function (result ) {   
            if(result == false){
              console.log("cashout non eseguito");

            }  
            console.log("cashout eseguito");
            location.reload(true);
            window.location = "http://localhost:3000/profile.html";
          });
      });
      
      return App.GetStatus();
    }


  
  };
  
  $(function() {
    $(window).load(function() {
      App.initWeb3();
    });
  });