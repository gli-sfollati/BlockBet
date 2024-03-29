// SPDX-License-Identifier: MIT
import "./Profile.sol";
pragma solidity ^0.8.19;


contract Roulette is Profile{
  
  uint betAmount;
  uint necessaryBalance;
  uint nextRoundTimestamp;
  uint256 maxAmountAllowedInTheBank;
  mapping (address => uint256) winnings;
  uint8[] payouts;
  uint8[] numberRange;
  uint estratto;
  
  /*
    BetTypes are as follow:
      0: color
      1: column
      2: dozen
      3: eighteen
      4: modulus
      5: number
      
    Depending on the BetType, number will be:
      color: 0 for black, 1 for red
      column: 0 for left, 1 for middle, 2 for right
      dozen: 0 for first, 1 for second, 2 for third
      eighteen: 0 for low, 1 for high
      modulus: 0 for even, 1 for odd
      number: number
  */
  
  struct Bet {
    address player;
    uint8 betType;
    uint8 number;
    uint amount;
  }
  Bet[] public bets;
  
  constructor() payable {
    necessaryBalance = 0;
    nextRoundTimestamp = block.timestamp;
    payouts = [1,2,2,1,1,35];//moltiplicatori giocate es nero paga x1 ma non scala la puntata
    numberRange = [1,2,2,1,1,36];
    betAmount = 10000000000000000; /* 0.01 ether */
    maxAmountAllowedInTheBank = 2000000000000000000; /* 2 ether */
  }

  event RandomNumber(uint256 number);
  
  function getStatus() public view returns(uint, uint, uint, uint) {
    return (
      bets.length,             // number of active bets
      bets.length * betAmount, // value of active bets
      nextRoundTimestamp,      // when can we play again
      winnings[msg.sender]     // winnings of player
    ); 
  }



  function bet(uint8 number, uint8 betType,uint256 am) payable public{

    //prossimo upgrade far memorizzare più bet
    delete bets; //in modo da conservare un solo bet al suo interno

    /* 
       A bet is valid when:
       1 - the value of the bet is correct (=betAmount)
       2 - betType is known (between 0 and 5)
       3 - the option betted is valid (don't bet on 37!)
       4 - the bank has sufficient funds to pay the bet
     */
      //require(msg.value == betAmount, "non hai versato abbastanza fondi");                               // 1
    // require(amount>=10000000000000000,"per ogni puntata almeno 0.01eth");
    require(betType >= 0 && betType <= 5, "non hai inserito la giusta giocata");                         // 2
    require(number >= 0 && number <= numberRange[betType], "che numero di giocata hai selezionato?");        // 3
   
      // uint payoutForThisBet = payouts[betType] * msg.value; 
     //  uint provisionalBalance = necessaryBalance + payoutForThisBet;
    // require(provisionalBalance < address(this).balance, "la banca non ha abbastanza fondi da darti se vincessi");           // 4
     /* we are good to go */
      //necessaryBalance += payoutForThisBet;


    bets.push(Bet({
      amount: am,
      betType: betType,
      player: msg.sender,
      number: number
    }));

  }


//prova per valutare la corretta esecuzione della funzione bet
 function getBet() public view returns(uint,uint8,uint8,uint,uint){
  uint lung= bets.length;
  Bet memory b= bets[lung-1];
       return (
        b.amount,
        b.betType,
        b.number,
        lung,
        address(this).balance
       );
    
  }


   function spinWheel() public {
    /* are there any bets? */
    require(bets.length > 0, "non ci sono giocate");
    //require(msg.value > 10000000000000000 wei, "non sono stati versati abbastanza fondi ");  
    /* are we allowed to spin the wheel? */
    require(block.timestamp > nextRoundTimestamp, "non e passato abbastanza tempo per poter rigiocare");
    /* next time we are allowed to spin the wheel again */
    nextRoundTimestamp = block.timestamp;
    /* calculate 'random' number */
    uint diff = block.difficulty;
    bytes32 hash = blockhash(block.number-1);
    Bet memory lb = bets[bets.length-1];
    uint number = uint(keccak256(abi.encodePacked(block.timestamp, diff, hash, lb.betType, lb.player, lb.number))) % 37;

    /* check every bet for this number */ 
    //for (uint i = 0; i < bets.length; i++) {
     uint i=0; //prende la prima e unica puntata
      bool won = false;
      Bet memory b = bets[i];
      betAmount=bets[i].amount;
      
      if (number == 0) {
        won = (b.betType == 5 && b.number == 0);                   /* bet on 0 */
      } else {
        if (b.betType == 5) { 
          won = (b.number == number);                              /* bet on number */
        } else if (b.betType == 4) {
          if (b.number == 0) won = (number % 2 == 0);              /* bet on even */
          if (b.number == 1) won = (number % 2 == 1);              /* bet on odd */
        } else if (b.betType == 3) {            
          if (b.number == 0) won = (number <= 18);                 /* bet on low 18s */
          if (b.number == 1) won = (number >= 19);                 /* bet on high 18s */
        } else if (b.betType == 2) {                               
          if (b.number == 0) won = (number <= 12);                 /* bet on 1st dozen */
          if (b.number == 1) won = (number > 12 && number <= 24);  /* bet on 2nd dozen */
          if (b.number == 2) won = (number > 24);                  /* bet on 3rd dozen */
        } else if (b.betType == 1) {               
          if (b.number == 0) won = (number % 3 == 1);              /* bet on left column */
          if (b.number == 1) won = (number % 3 == 2);              /* bet on middle column */
          if (b.number == 2) won = (number % 3 == 0);              /* bet on right column */
        } else if (b.betType == 0) {
          if (b.number == 0) {                                     /* bet on black */
            if (number <= 10 || (number >= 20 && number <= 28)) {
              won = (number % 2 == 0);
            } else {
              won = (number % 2 == 1);
            }
          } else {                                                 /* bet on red */
            if (number <= 10 || (number >= 20 && number <= 28)) {
              won = (number % 2 == 1);
            } else {
              won = (number % 2 == 0);
            }
          }
        }
      }
       addToPlayer[b.player].totalCashFlow +=betAmount;


      /* if winning bet, add to player winnings balance */
      if (won) {
        //aggiungiamo il saldo all utente
       // winnings[b.player] += betAmount * payouts[b.betType];
        //aggiorniamo le giocate del giocatore;
        addToPlayer[b.player].game +=1;
        addToPlayer[b.player].gameWin +=1;
        addToPlayer[b.player].cashInBank += betAmount * payouts[b.betType];
        if((betAmount * payouts[b.betType])+ betAmount > addToPlayer[b.player].maxWin){
          addToPlayer[b.player].maxWin = (betAmount * payouts[b.betType])+betAmount;
        }
      }else{
        //togliamo saldo all'utente
        addToPlayer[b.player].cashInBank = addToPlayer[b.player].cashInBank - betAmount;
        addToPlayer[b.player].game +=1;
      }
   // }
    /* delete all bets */
    //bets.length = 0;
   delete bets;

    /* reset necessaryBalance */
    necessaryBalance = 0;

    /* returns 'random' number to UI */
    emit RandomNumber(number);
    //return number;
  }


  /*

  function cashOut() public {
    address payable player = payable(msg.sender);
    uint256 amount = winnings[player];
    require(amount > 0);
    require(amount <= address(this).balance);
    winnings[player] = 0;
    player.transfer(amount);
  }
  
  function takeProfits() internal {
    uint amount = address(this).balance - maxAmountAllowedInTheBank;
    if (amount > 0) creator.transfer(amount);
  }
  
  function creatorKill() public {
    require(msg.sender == creator);
    
    creator.transfer(address(this).balance);
    //selfdestruct(creator);
  }
  */
 
}