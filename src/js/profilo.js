Profilo = {
  web3Provider: null,
  contracts: {},


  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      Profilo.web3Provider = window.ethereum;
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
      Profilo.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      Profilo.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(Profilo.web3Provider);

    return Profilo.initContract();
  },

  initContract: function () {
    $.getJSON('Roulette.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var RouletteArtifact = data;
      Profilo.contracts.Roulette = TruffleContract(RouletteArtifact);

      // Set the provider for our contract
      Profilo.contracts.Roulette.setProvider(Profilo.web3Provider);

      //return Profilo.GetStatPlayer();
    });
    return Profilo.GetStatPlayer();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-nome', Profilo.SetNome);
    $(document).on('click', '.btn-registrati', Profilo.Registrati);

    window.ethereum.on('accountsChanged', () => {
      window.location.reload();
    })

  },


  //Restituisce tutte le statistiche dei giocatori 
  GetStatPlayer: async function () {
    var RouletteInstance;
    $.getJSON('Roulette.json', function (data) {
      var RouletteArtifact = data;
      Profilo.contracts.Roulette = TruffleContract(RouletteArtifact);
      Profilo.contracts.Roulette.setProvider(Profilo.web3Provider);
      Profilo.contracts.Roulette.deployed().then(async function (instance) {

        var nome = document.getElementById("nome");
        var indirizzo = document.getElementById("indirizzo");
        var massimaVincita = document.getElementById("massimaVincita");
        var soldiTotaliGiocati = document.getElementById("soldiTotaliGiocati");
        var scommesseVinte = document.getElementById("scommesseVinte");
        var scommesseiPazzate = document.getElementById("scommesseiPazzate");
        var soldiNelConto = document.getElementById("soldiNelConto");

        RouletteInstance = instance;

        try{

        var accounts = await ethereum.request({ method: 'eth_accounts' });
        var data = await RouletteInstance.getStatoUtente.call({ from: accounts[0] });

        if (data[5] == "0x0000000000000000000000000000000000000000") {
          var bttNome = document.getElementById("bottoneNome");
          bttNome.style.display = "none"
        }

        nome.innerHTML += data[0];
        soldiTotaliGiocati.innerHTML += (data[3]/1000000000000000000+ " eth");
        scommesseiPazzate.innerHTML += data[1];
        soldiNelConto.innerHTML += (data[4]/1000000000000000000+ " eth") ;
        massimaVincita.innerHTML += data[2];
        indirizzo.innerHTML += data[5];
        scommesseVinte.innerHTML += data[6]; //da fare nel contratto
        console.log(data[6]);

      }catch{
          var btt = document.getElementById("bottoneRegistrati");
          var text1 = document.getElementById("text1")
          btt.style.display = "inline"
          text1.style.display = "block"
      }

        return data;
      }).then(function (result) {
        console.log("è stato visualizzato tutto correttamente " + " nome: " + result[0] + " game: " + result[1] +" gameWin: " + result[6]+ "maxWin: " + result[2] + "totalcashlow: " + result[3] + " cash in bank: " + result[4] + " indirizzo" + result[5])
      });
    });

    return Profilo.bindEvents();
  },


  //se il giocatore non è registrato e clicca il pulsante registrati, 
  //viene spedito sulla pagina di registrazione
  Registrati: async function (event) {
    event.preventDefault();
    window.location = "http://localhost:3000/signUp.html";
    return Profilo.bindEvents();
  },


  SetNome: function (event) {
    var accounts = ethereum.request({ method: 'eth_accounts' });
    console.log(accounts);
    event.preventDefault();
    var RouletteInstance;
    $.getJSON('Roulette.json', function (data) {
      var RouletteArtifact = data;
      Profilo.contracts.Roulette = TruffleContract(RouletteArtifact);
      Profilo.contracts.Roulette.setProvider(Profilo.web3Provider);

      Profilo.contracts.Roulette.deployed().then(async function (instance) {
        RouletteInstance = instance;
        var nuovoNome = "nomeFittizio";
        var accounts = await ethereum.request({ method: 'eth_accounts' });
        var data = await RouletteInstance.getStatoUtente.call();

        return await RouletteInstance.setUsername(nuovoNome, { from: accounts[0] });
      }).then(function (result) {
        console.log("il nome è stato modificato e ora si chiama " + result);
        location.reload(true);
      });
    });
    return Profilo.GetStatPlayer();
  },





};

$(function () {
  $(window).load(function () {
    Profilo.initWeb3();
  });
});