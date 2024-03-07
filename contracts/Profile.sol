// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Profile {
    address payable creator;
    uint256 deposito = 1 * (1 ether);
    address myContract = address(this);

    //creazione del giocatore
    struct Player {
        string username;
        uint game; //totali partite giocate
        uint gameWin; //partite vinte
        uint maxWin; //massima vincita
        uint totalCashFlow; //totali dei soldi giocati
        uint cashInBank; //soldi depositati nel contratto
        address addPlayer;
        bool exist;
    }

    //struttura che tiene traccia delle info dei giocatori
    mapping(address => Player) public addToPlayer;

    //struttura che tiene traccia dell'esistenza dei giocatori
    mapping(address => bool) public indirizzoEsiste;

    event newPlayer(string, address, uint);
    event existingPlayer(string, address);

    constructor() payable {
        
        creator = payable(msg.sender);
        addToPlayer[creator] = Player("_adil_2", 0, 0, 0, 0, 0, creator, true);

    }

    //Serve a depositare del denaro
    function addEther() public payable returns (bool) {
        require(msg.value > 0, "non puoi trasferire una quantita pari a 0");
        addToPlayer[msg.sender].cashInBank += (msg.value) ;
        return true;
    }


    //restituisce lo stato generale del contratto
    function getStato() public view returns (uint, uint) {
        return (address(this).balance / 1 ether, deposito);
    }


    //Permette di far prelevare un giocatore
    function cashOut(uint x) public {
        //controllo che il giocartore abbia delle finanze
        require(addToPlayer[msg.sender].cashInBank > 0,"non hai soldi da prelevare");
        //controllo che la quantità di denaro che si vuole prelevare sia minore o uguale a quanti soldi si dispone 
        require(addToPlayer[msg.sender].cashInBank >= x, "non hai abbastanza soldi");
        //Controllo se ci sono abbastanza fondi per pagare
        require(addToPlayer[msg.sender].cashInBank <= address(this).balance,"non si sono abbastanza fonsi nel contratto per pagarti");
        address payable player = payable(msg.sender);
        addToPlayer[msg.sender].cashInBank -= x;
        player.transfer(x);
    }


    //ti da la possibilità di poter cambiare username 
    function setUsername(string memory _username) public returns (string memory) {
        require(
            addToPlayer[msg.sender].addPlayer == msg.sender,
            "L'indirizzo non esiste nel mapping o non combaciano"
        );
        string memory nome = _username;
        addToPlayer[msg.sender].username = nome;
        return nome;
    }

    //restituisce le statistiche di un player
    function getStatoUtente() public view returns (string memory, uint, uint, uint, uint, address,uint, bool){
        //verifichiamo che il chiamante sia il diretto interessato.
        require(addToPlayer[msg.sender].addPlayer == msg.sender,"L'indirizzo non esiste nel mapping o non combaciano");

        return (
            addToPlayer[msg.sender].username,
            addToPlayer[msg.sender].game,
            addToPlayer[msg.sender].maxWin,
            addToPlayer[msg.sender].totalCashFlow,
            addToPlayer[msg.sender].cashInBank,
            addToPlayer[msg.sender].addPlayer,
            addToPlayer[msg.sender].gameWin,
            addToPlayer[msg.sender].exist
        );
    }

    //restituisce  false se il giocatore già esiste
    //restituisce true se il giocatore è stato creato correttamente
    function addPlayer(string memory _name) public payable returns (address) {
        require(bytes(_name).length > 0, "Nome inserito non valido");

        address p = msg.sender;

        Player memory giocatore = Player(_name, 0, 0, 0, 0, 1000000000000000000, p, true);

        addToPlayer[p] = giocatore;
        
        return p;
    }
}
