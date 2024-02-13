App = {
    web3Provider: null,
    contracts: {},

	init: async function() {
		// creazione roulette
		$.getJSON('Roulette.json', function(data) {
			startGame();
	});
	
		return await App.initWeb3();
	  },

  
    initWeb3: async function() {
      // Modern dapp browsers...
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.enable();
        } catch (error) {
          // User denied account access...
          console.error("User denied account access");
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
		  // Get the necessary contract artifact file and instantiate it with @truffle/contract
		  var RouletteArtifact = data;
		  App.contracts.Roulette = TruffleContract(RouletteArtifact);
		
		  // Set the provider for our contract
		  App.contracts.Roulette.setProvider(App.web3Provider);
		
		  // Use our contract to retrieve and mark the adopted pets
		  //return App.spinWheel2();
		});
		
	
		return App.bindEvents();
	  },

	
	  bindEvents: function() {
		$(document).on('click', '.spinBtn', App.goGame);
		$(document).on('click', '.btn-ultimobet', App.getBets);
		window.ethereum.on('accountsChanged', () => {
			window.location.reload();
		  })
	  },


	goGame: function(event) {
		//var accounts = ethereum.request({ method: 'eth_accounts' });
      //console.log(accounts);
		//event.preventDefault();
	
		var rouletteInstance;

		var lung=bet.length;

		console.log("cifra da scommetere: "+bet[lung-1].amt);
		console.log("BetType: "+bet[lung-1].bettype);
		console.log("Number: "+bet[lung-1].val);

		var amount=bet[lung-1].amt*1000000000000000000;
		var bettype=bet[lung-1].bettype;
		var number=bet[lung-1].val;
		
	
		$.getJSON('Roulette.json', function (data) {
			var RouletteArtifact = data;
			App.contracts.Roulette = TruffleContract(RouletteArtifact);
			App.contracts.Roulette.setProvider(App.web3Provider);

			
  
			App.contracts.Roulette.deployed().then(async function (instance) {
			  rouletteInstance = instance;
  
			  var accounts = await ethereum.request({ method: 'eth_accounts' });

			  console.log(accounts[0]);

			  const options = {from: accounts[0], value:amount};
			  return await rouletteInstance.bet(number,bettype,options);
			 // var ritorno = price[0];
			  //console.log(price);
			
			}).then(function (result) {  
				
				return App.getBets();
				//return App.getStatoUtente();
			});

			
		});

	  },

	  getBets: function() {
		
		var accounts = ethereum.request({ method: 'eth_accounts' });
      	console.log(accounts);
		//event.preventDefault();
	
		var rouletteInstance;

	
	
		$.getJSON('Roulette.json', function (data) {
			var RouletteArtifact = data;
			App.contracts.Roulette = TruffleContract(RouletteArtifact);
			App.contracts.Roulette.setProvider(App.web3Provider);

			App.contracts.Roulette.deployed().then(async function (instance) {
			  rouletteInstance = instance;
  
			  var accounts = await ethereum.request({ method: 'eth_accounts' });

			  //console.log(accounts[0]);

			 return rouletteInstance.getBet({from: accounts[0]});
			  console.log("ciao1");
			  console.log(console1);
			
			}).then(function (result) {   
				console.log("ciao2");  
				var r=result;
			  console.log(r);
			 return App.spinWheel();
			});

			
		});
	  },

	  spinWheel: function() {
		
		var accounts = ethereum.request({ method: 'eth_accounts' });
      	console.log(accounts);
		//event.preventDefault();
	
		var rouletteInstance;

	
	
		$.getJSON('Roulette.json', function (data) {
			var RouletteArtifact = data;
			App.contracts.Roulette = TruffleContract(RouletteArtifact);
			App.contracts.Roulette.setProvider(App.web3Provider);

			App.contracts.Roulette.deployed().then(async function (instance) {
			  rouletteInstance = instance;
  
			  var accounts = await ethereum.request({ method: 'eth_accounts' });

			  //console.log(accounts[0]);

			 return rouletteInstance.spinWheel({from: accounts[0]});
			  
			
			}).then(function (result) {   
				console.log("ciao3");  
				var r=result;
				var numero=r.logs[0].args.number.c[0]
			  console.log("estratto: "+ numero);
			  spin(numero);
			  App.getStatoUtente();
			});
			
			
		});

	},

	//non stampa alcun dato dell utente
	getStatoUtente:async  function() {
		var profileInstance;
		//var dato1 = document.getElementById("dato1");
		$.getJSON('Profile.json', function (data) {
			var ProfileArtifact = data;
			App.contracts.Profile = TruffleContract(ProfileArtifact);
  
			App.contracts.Profile.setProvider(App.web3Provider);
  
			App.contracts.Profile.deployed().then(async function (instance) {
			  profileInstance = instance;
			  var accounts = await ethereum.request({ method: 'eth_accounts' });
			  console.log(accounts[0]);

				var data =await profileInstance.getStatoUtente.call();
				console.log(data);
				return data;
			}).then(function (result) {
				
			});
		});
		
		//return App.bindEvents();
	  },

  
  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });


  	const BET_AMOUNT =  10000000000000000n; /* 0,01 ether, around $6 */
	const GAS = 70000000;
	const GAS_PRICE = 2000000000;

  let bankValue = 10;
  let currentBet = 0;
  let wager = 0.05;
  let lastWager = 0.0;
  let bet = [];
  let numbersBet = [];
  let previousNumbers = [];

  let numRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  let wheelnumbersAC = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

  let container = document.createElement('div');
  container.setAttribute('id', 'container');
  document.body.append(container);


function resetGame(){
	bankValue = 10;
	currentBet = 0;
	wager = 0.05;
	bet = [];
	numbersBet = [];
	previousNumbers = [];
	document.getElementById('betting_board').remove();
	document.getElementById('notification').remove();
	buildBettingBoard();
}

function startGame(){
	buildWheel();
	buildBettingBoard();
}

function gameOver(){
	let notification = document.createElement('div');
	notification.setAttribute('id', 'notification');
		let nSpan = document.createElement('span');
		nSpan.setAttribute('class', 'nSpan');
		nSpan.innerText = 'Bankrupt';
		notification.append(nSpan);

		let nBtn = document.createElement('div');
		nBtn.setAttribute('class', 'nBtn');
		nBtn.innerText = 'Play again';	
		nBtn.onclick = function(){
			resetGame();
		};
		notification.append(nBtn);
	container.prepend(notification);
}

function buildWheel(){
	let wheel = document.createElement('div');
	wheel.setAttribute('class', 'wheel');

	let outerRim = document.createElement('div');
	outerRim.setAttribute('class', 'outerRim');
	wheel.append(outerRim);

	let numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
	for(i = 0; i < numbers.length; i++){
		let a = i + 1;
		let spanClass = (numbers[i] < 10)? 'single' : 'double';
		let sect = document.createElement('div');
		sect.setAttribute('id', 'sect'+a);
		sect.setAttribute('class', 'sect');
		let span = document.createElement('span');
		span.setAttribute('class', spanClass);
		span.innerText = numbers[i];
		sect.append(span);
		let block = document.createElement('div');
		block.setAttribute('class', 'block');
		sect.append(block);
		wheel.append(sect);
	}


	
	
	let pocketsRim = document.createElement('div');
	pocketsRim.setAttribute('class', 'pocketsRim');
	wheel.append(pocketsRim);

	let ballTrack = document.createElement('div');
	ballTrack.setAttribute('class', 'ballTrack');
	let ball = document.createElement('div');
	ball.setAttribute('class', 'ball');
	ballTrack.append(ball);
	wheel.append(ballTrack);

	let pockets = document.createElement('div');
	pockets.setAttribute('class', 'pockets');
	wheel.append(pockets);

	let cone = document.createElement('div');
	cone.setAttribute('class', 'cone');
	wheel.append(cone);

	let turret = document.createElement('div');
	turret.setAttribute('class', 'turret');
	wheel.append(turret);

	let turretHandle = document.createElement('div');
	turretHandle.setAttribute('class', 'turretHandle');
	let thendOne = document.createElement('div');
	thendOne.setAttribute('class', 'thendOne');
	turretHandle.append(thendOne);
	let thendTwo = document.createElement('div');
	thendTwo.setAttribute('class', 'thendTwo');
	turretHandle.append(thendTwo);
	wheel.append(turretHandle);

	container.append(wheel);
}


function buildBettingBoard(){
	let bettingBoard = document.createElement('div');
	bettingBoard.setAttribute('id', 'betting_board');

	let wl = document.createElement('div');
	wl.setAttribute('class', 'winning_lines');
	
	var wlttb = document.createElement('div');
	wlttb.setAttribute('id', 'wlttb_top');
	wlttb.setAttribute('class', 'wlttb');
	

	bettingBoard.append(wl);

	let bbtop = document.createElement('div');
	bbtop.setAttribute('class', 'bbtop');
	let bbtopBlocks = ['1 to 18', '19 to 36'];
	for(i = 0; i < bbtopBlocks.length; i++){
		let f = i;
		var bbtoptwo = document.createElement('div');
		bbtoptwo.setAttribute('class', 'bbtoptwo');
		let num = (f == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18' : '19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36';
		var objType = (f == 0)? 'outside_low' : 'outside_high';
		bbtoptwo.onclick = function(){
			if(f==0){
				setBet(this, num, objType, 1, 3, 0); //bettype 3 da 1 a 18 numeri 
			}else{
				setBet(this, num, objType, 1, 3, 1); //bettype 3 da 18 a 36 numeri 
			}
			
		};
		bbtoptwo.oncontextmenu = function(e){
			e.preventDefault();
			removeBet(this, num, objType, 1);
		};
		bbtoptwo.innerText = bbtopBlocks[i];
		bbtop.append(bbtoptwo);
	}
	bettingBoard.append(bbtop);

	let numberBoard = document.createElement('div');
	numberBoard.setAttribute('class', 'number_board');

	let zero = document.createElement('div');
	zero.setAttribute('class', 'number_0');
	var objType = 'zero';
	var odds = 35;
	zero.onclick = function(){
		setBet(this, '0', objType, odds, 5 ,0); //value 5 considerato come numero 
	};
	zero.oncontextmenu = function(e){
		e.preventDefault();
		removeBet(this, '0', objType, odds);
	};
	let nbnz = document.createElement('div');
	nbnz.setAttribute('class', 'nbn');
	nbnz.innerText = '0';
	zero.append(nbnz);
	numberBoard.append(zero);
	
	var numberBlocks = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, '2 to 1', 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, '2 to 1', 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, '2 to 1'];
	var redBlocks = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
	for(i = 0; i < numberBlocks.length; i++){
		let a = i;
		var nbClass = (numberBlocks[i] == '2 to 1')? 'tt1_block' : 'number_block';
		var colourClass = (redBlocks.includes(numberBlocks[i]))? ' redNum' : ((nbClass == 'number_block')? ' blackNum' : '');
		var numberBlock = document.createElement('div');
		numberBlock.setAttribute('class', nbClass + colourClass);

		numberBlock.onclick = function(){
			if(numberBlocks[a] != '2 to 1'){
				setBet(this, ''+numberBlocks[a]+'', 'inside_whole', 35, 5,numberBlocks[a]); //bettype 5 numer con value il suo valore
			}else{
				num = (a == 12)? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : ((a == 25)? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
				if(a==12){
					setBet(this, num, 'outside_column', 2, 2, 0); //bettype 2
				}else if(a==25){
					setBet(this, num, 'outside_column', 2, 2, 1); //bettype 2
				}else{
					setBet(this, num, 'outside_column', 2, 2, 2); //bettype 2
				}
				
			}
		};
		numberBlock.oncontextmenu = function(e){
			e.preventDefault();
			if(numberBlocks[a] != '2 to 1'){
				removeBet(this, ''+numberBlocks[a]+'', 'inside_whole', 35); 
			}else{
				num = (a == 12)? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : ((a == 25)? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
				removeBet(this, num, 'outside_column', 2);
			}
		};
		var nbn = document.createElement('div');
		nbn.setAttribute('class', 'nbn');


		nbn.innerText = numberBlocks[i];


		

		


		numberBlock.append(nbn);
		numberBoard.append(numberBlock);
	}
	bettingBoard.append(numberBoard);

	
	let bo3Board = document.createElement('div');
	bo3Board.setAttribute('class', 'bo3_board');	
	let bo3Blocks = ['1 to 12', '13 to 24', '25 to 36'];
	for(i = 0; i < bo3Blocks.length; i++){
		let b = i;
		var bo3Block = document.createElement('div');
		bo3Block.setAttribute('class', 'bo3_block');
		bo3Block.onclick = function(){
			num = (b == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : ((b == 1)? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
			if(b==0){
				setBet(this, num, 'outside_dozen', 2, 1,0);//bettype 1
			}else if(b==1){
				setBet(this, num, 'outside_dozen', 2, 1,1);//bettype 1
			}else{
				setBet(this, num, 'outside_dozen', 2, 1,2);//bettype 1
			}
			
		};
		bo3Block.oncontextmenu = function(e){
			e.preventDefault();
			num = (b == 0)? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : ((b == 1)? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
			removeBet(this, num, 'outside_dozen', 2);
		};
		bo3Block.innerText = bo3Blocks[i];
		bo3Board.append(bo3Block);
	}
	bettingBoard.append(bo3Board);

	let otoBoard = document.createElement('div');
	otoBoard.setAttribute('class', 'oto_board');	
	let otoBlocks = ['EVEN', 'RED', 'BLACK', 'ODD'];
	for(i = 0; i < otoBlocks.length; i++){
		let d = i;
		var colourClass = (otoBlocks[i] == 'RED')? ' redNum' : ((otoBlocks[i] == 'BLACK')? ' blackNum' : '');
		var otoBlock = document.createElement('div');
		otoBlock.setAttribute('class', 'oto_block' + colourClass);
		otoBlock.onclick = function(){
			num = (d == 0)? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : ((d == 1)? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : ((d == 2)? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
			if(d==0){
				setBet(this, num, 'outside_oerb', 1, 4, 0); //bettype 4 0-> pari
			}else if(d==1){
				setBet(this, num, 'outside_oerb', 1, 0, 1); //bettype 0 1-> rossi
			}else if(d==2){
				setBet(this, num, 'outside_oerb', 1, 0, 0); //bettype 0 0-> neri
			}else{
				setBet(this, num, 'outside_oerb', 1, 4, 1); //bettype 4 1-> dispari
			}
			
		};
		otoBlock.oncontextmenu = function(e){
			num = (d == 0)? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : ((d == 1)? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : ((d == 2)? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
			e.preventDefault();
			removeBet(this, num, 'outside_oerb', 1);
		};
		otoBlock.innerText = otoBlocks[i];
		otoBoard.append(otoBlock);
	}
	bettingBoard.append(otoBoard);

	let chipDeck = document.createElement('div');
	chipDeck.setAttribute('class', 'chipDeck');
	let chipValues = [0.01, 0.05, 0.1, 1, 'clear'];
	for(i = 0; i < chipValues.length; i++){
		let cvi = i;
		let chipColour = (i == 0)? 'red' : ((i == 1)? 'blue cdChipActive' : ((i == 2)? 'orange' : ((i == 3)? 'gold' : 'clearBet')));
		let chip = document.createElement('div');
		chip.setAttribute('class', 'cdChip ' + chipColour);
		chip.onclick = function(){
			if(cvi !== 4){
				let cdChipActive = document.getElementsByClassName('cdChipActive');
				for(i = 0; i < cdChipActive.length; i++){
					cdChipActive[i].classList.remove('cdChipActive');
				}
				let curClass = this.getAttribute('class');
				if(!curClass.includes('cdChipActive')){
					this.setAttribute('class', curClass + ' cdChipActive');
				}
				wager = parseFloat(chip.childNodes[0].innerText);
			}else{
				bankValue = bankValue + currentBet;
				currentBet = 0;
				document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
				document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
				clearBet();
				removeChips();
			}
		};
		let chipSpan = document.createElement('span');
		chipSpan.setAttribute('class', 'cdChipSpan');
		chipSpan.innerText = chipValues[i];
		chip.append(chipSpan);
		chipDeck.append(chip);
	}
	bettingBoard.append(chipDeck);

	let bankContainer = document.createElement('div');
	bankContainer.setAttribute('class', 'bankContainer');

	let bank = document.createElement('div');
	bank.setAttribute('class', 'bank');
	let bankSpan = document.createElement('span');
	bankSpan.setAttribute('id', 'bankSpan');
	bankSpan.innerText = '' + bankValue.toLocaleString("en-GB") + '';
	bank.append(bankSpan);
	bankContainer.append(bank);

	let bet = document.createElement('div');
	bet.setAttribute('class', 'bet');
	let betSpan = document.createElement('span');
	betSpan.setAttribute('id', 'betSpan');
	betSpan.innerText = '' + currentBet.toLocaleString("en-GB") + '';
	bet.append(betSpan);
	bankContainer.append(bet);	
	bettingBoard.append(bankContainer);

	let pnBlock = document.createElement('div');
	pnBlock.setAttribute('class', 'pnBlock');
	let pnContent = document.createElement('div');
	pnContent.setAttribute('id', 'pnContent');
	pnContent.onwheel = function(e){
		e.preventDefault();
		pnContent.scrollLeft += e.deltaY;
	};
	pnBlock.append(pnContent);	
	bettingBoard.append(pnBlock);
	
	container.append(bettingBoard);
}


function clearBet(){
	bet = [];
	numbersBet = [];
}

/*
	(BetTypes)
    BetTypes are as follow:
      0: color rosso o nero
      1: column 2 to 1
      2: dozen 1 of 12
      3: eighteen 1 of 18
      4: modulus pari o dispari
      5: number
      
	  (Value)
    Depending on the BetType, number will be:
      color: 0 for black, 1 for red
      column: 0 for left, 1 for middle, 2 for right
      dozen: 0 for first, 1 for second, 2 for third
      eighteen: 0 for low, 1 for high
      modulus: 0 for even, 1 for odd
      number: number
  */

function setBet(e, n, t, o,betType,value){
	//log per verificare le chips
	console.log(n);
	console.log(t);
	console.log(o);
	console.log(betType);
	console.log(value);
	lastWager = wager;
	wager = (bankValue < wager)? bankValue : wager;
	if(wager > 0){
		if(!container.querySelector('.spinBtn')){
			let spinBtn = document.createElement('div');
			spinBtn.setAttribute('class', 'spinBtn');
			spinBtn.innerText = 'spin';
			/*
			spinBtn.onclick = function(){
				this.remove();
				spin();
			};*/
			

			container.append(spinBtn);
		}
		bankValue = bankValue - wager;
		currentBet = currentBet + wager;
		document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
		document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
		for(i = 0; i < bet.length; i++){
			if(bet[i].numbers == n && bet[i].type == t){
				
				bet[i].amt = bet[i].amt + wager;
				let val= bet[i].amt;
				val=(val*1).toFixed(2);
				bet[i].amt=val*1;
				
				let chipColour = (bet[i].amt < 0.05)? 'red' : ((bet[i].amt < 0.1)? 'blue' : ((bet[i].amt < 1)? 'orange' : 'gold'));
				e.querySelector('.chip').style.cssText = '';
				e.querySelector('.chip').setAttribute('class', 'chip ' + chipColour);
				let chipSpan = e.querySelector('.chipSpan');
				chipSpan.innerText = bet[i].amt;
				return;
			}
		}
		var obj = {
			amt: wager,
			type: t,
			odds: o,
			numbers: n,
			bettype: betType,
			val: value
		};
		bet.push(obj);
		
		let numArray = n.split(',').map(Number);
		for(i = 0; i < numArray.length; i++){
			if(!numbersBet.includes(numArray[i])){
				numbersBet.push(numArray[i]);
			}
		}

		if(!e.querySelector('.chip')){
			let chipColour = (wager < 0.05)? 'red' : ((wager < 0.1)? 'blue' : ((wager < 1)? 'orange' : 'gold'));
			let chip = document.createElement('div');
			chip.setAttribute('class', 'chip ' + chipColour);
			let chipSpan = document.createElement('span');
			chipSpan.setAttribute('class', 'chipSpan');
			chipSpan.innerText = wager;
			chip.append(chipSpan);
			e.append(chip);
		}
	}
}

function spin(number){
	var winningSpin = number
	spinWheel(winningSpin);
	setTimeout(function(){
		if(numbersBet.includes(winningSpin)){
			let winValue = 0;
			let betTotal = 0;
			for(i = 0; i < bet.length; i++){
				var numArray = bet[i].numbers.split(',').map(Number);
				if(numArray.includes(winningSpin)){
					bankValue = (bankValue + (bet[i].odds * bet[i].amt) + bet[i].amt);
					winValue = winValue + (bet[i].odds * bet[i].amt);
					betTotal = betTotal + bet[i].amt;
				}
			}
			win(winningSpin, winValue, betTotal);
		}

		currentBet = 0;
		document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
		document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
		
		let pnClass = (numRed.includes(winningSpin))? 'pnRed' : ((winningSpin == 0)? 'pnGreen' : 'pnBlack');
		let pnContent = document.getElementById('pnContent');
		let pnSpan = document.createElement('span');
		pnSpan.setAttribute('class', pnClass);
		pnSpan.innerText = winningSpin;
		pnContent.append(pnSpan);
		pnContent.scrollLeft = pnContent.scrollWidth;

		bet = [];
		numbersBet = [];
		removeChips();
		wager = lastWager;
		if(bankValue == 0 && currentBet == 0){
			gameOver();
		}
	}, 10000);
}

//banner quando si vince
function win(winningSpin, winValue, betTotal){
	if(winValue > 0){
		let notification = document.createElement('div');
		notification.setAttribute('id', 'notification');
			let nSpan = document.createElement('div');
			nSpan.setAttribute('class', 'nSpan');
				let nsnumber = document.createElement('span');
				nsnumber.setAttribute('class', 'nsnumber');
				nsnumber.style.cssText = (numRed.includes(winningSpin))? 'color:red' : 'color:black';
				nsnumber.innerText = winningSpin;
				nSpan.append(nsnumber);
				let nsTxt = document.createElement('span');
				nsTxt.innerText = ' Win';
				nSpan.append(nsTxt);
				let nsWin = document.createElement('div');
				nsWin.setAttribute('class', 'nsWin');
					let nsWinBlock = document.createElement('div');
					nsWinBlock.setAttribute('class', 'nsWinBlock');
					nsWinBlock.innerText = 'Bet: ' + betTotal;
					nSpan.append(nsWinBlock);
					nsWin.append(nsWinBlock);
					nsWinBlock = document.createElement('div');
					nsWinBlock.setAttribute('class', 'nsWinBlock');
					nsWinBlock.innerText = 'Win: ' + winValue;
					nSpan.append(nsWinBlock);
					nsWin.append(nsWinBlock);
					nsWinBlock = document.createElement('div');
					nsWinBlock.setAttribute('class', 'nsWinBlock');
					nsWinBlock.innerText = 'Payout: ' + (winValue + betTotal);
					nsWin.append(nsWinBlock);
				nSpan.append(nsWin);
			notification.append(nSpan);
		container.prepend(notification);
		setTimeout(function(){
			notification.style.cssText = 'opacity:0';
		}, 3000);
		setTimeout(function(){
			notification.remove();
		}, 4000);
	}
}

function removeButtonSpin(){
	document.getElementsByClassName('spinBtn')[0].remove();
}

function removeBet(e, n, t, o){
	wager = (wager == 0)? 100 : wager;
	for(i = 0; i < bet.length; i++){
		if(bet[i].numbers == n && bet[i].type == t){
			if(bet[i].amt != 0){
				wager = (bet[i].amt > wager)? wager : bet[i].amt;
				bet[i].amt = bet[i].amt - wager;

				let val= bet[i].amt;
				val=(val*1).toFixed(2);
				bet[i].amt=val*1;


				bankValue = bankValue + wager;
				currentBet = currentBet - wager;
				document.getElementById('bankSpan').innerText = '' + bankValue.toLocaleString("en-GB") + '';
				document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
				if(bet[i].amt == 0){
					e.querySelector('.chip').style.cssText = 'display:none';
				}else{
					let chipColour = (bet[i].amt < 5)? 'red' : ((bet[i].amt < 10)? 'blue' : ((bet[i].amt < 100)? 'orange' : 'gold'));
					e.querySelector('.chip').setAttribute('class', 'chip ' + chipColour);
					let chipSpan = e.querySelector('.chipSpan');
					chipSpan.innerText = bet[i].amt;
				}
			}
		}
	}

	if(currentBet < 0.001  && container.querySelector('.spinBtn')){
        currentBet=0;
        document.getElementById('betSpan').innerText = '' + currentBet.toLocaleString("en-GB") + '';
		removeButtonSpin();
	}
}


//ferma la roulette sul numero generato
function spinWheel(winningSpin){


	let wheel = document.getElementsByClassName('wheel')[0];
	let ballTrack = document.getElementsByClassName('ballTrack')[0];

	if(bet.length==0){
		alert("Effettua una giocata");
		return;
	}
	for(i = 0; i < wheelnumbersAC.length; i++){
		if(wheelnumbersAC[i] == winningSpin){
			var degree = (i * 9.73) + 362;
		}
	}
	wheel.style.cssText = 'animation: wheelRotate 5s linear infinite;';
	ballTrack.style.cssText = 'animation: ballRotate 1s linear infinite;';

	setTimeout(function(){
		ballTrack.style.cssText = 'animation: ballRotate 2s linear infinite;';
		style = document.createElement('style');
		style.type = 'text/css';
		style.innerText = '@keyframes ballStop {from {transform: rotate(0deg);}to{transform: rotate(-'+degree+'deg);}}';
		document.head.appendChild(style);
	}, 2000);
	setTimeout(function(){
		ballTrack.style.cssText = 'animation: ballStop 3s linear;';
	}, 6000);
	setTimeout(function(){
		ballTrack.style.cssText = 'transform: rotate(-'+degree+'deg);';
	}, 9000);
	setTimeout(function(){
		wheel.style.cssText = '';
		style.remove();
	}, 10000);
}

function removeChips(){
	var chips = document.getElementsByClassName('chip');
	if(chips.length > 0){
		for(i = 0; i < chips.length; i++){
			chips[i].remove();
		}
		removeChips();
		removeButtonSpin();
	}

}
