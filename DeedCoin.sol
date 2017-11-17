pragma solidity ^0.4.15;



contract Ownable {
    address public owner;


    modifier onlyOwner() {
        if (msg.sender == owner)
            _;
        else {
            revert();
        }
    }
}

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal constant returns (uint256) {
    assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal constant returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;


  /**
   *  modifier to allow actions only when the contract IS paused
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   *  modifier to allow actions only when the contract IS NOT paused
   */
  modifier whenPaused() {
    require(paused);
    _;
  }

  /**
   *  called by the owner to pause, triggers stopped state
   */
  function pause() public onlyOwner whenNotPaused {
    paused = true;
    Pause();
  }

  /**
   *  called by the owner to unpause, returns to normal state
   */
  function unpause() public  onlyOwner whenPaused {
    paused = false;
    Unpause();
  }
}
contract Mortal is Ownable {

    function kill()  public {
        if (msg.sender == owner) {
            selfdestruct(owner);
        }
    }
}
contract UserTokensControl is Ownable{ 
    uint256 Now = block.timestamp;
    uint256 isUserAbleToTransferTime = 1522541000000;//control for transfer time April 1 2018 00 : 03 :00
    modifier isUserAbleToTransferCheck() {
        if(Now < isUserAbleToTransferTime) 
        {
            _;
        }
        else{
            revert();
        }
    }
    /**
     * Update control to only owner that user can transfer tokens or not
     */ 
    function updateUserAbleToTransferTime(uint256 timeForLockingPeriod) public onlyOwner {
        isUserAbleToTransferTime=timeForLockingPeriod;
    }
}

/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 */
contract ERC20Basic {
  uint256 public totalSupply;
  function balanceOf(address who) public constant returns (uint256);
  function transfer(address to, uint256 value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

/**
 * @title Basic token
 * @dev Basic version of StandardToken, with no allowances.
 */
contract BasicToken is ERC20Basic, UserTokensControl, Pausable {
  using SafeMath for uint256;
  bool isDistributeToFounders=false;
   address companyReserve;
    address founderReserve;
  mapping(address => uint256) balances;

  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  
  function transfer(address _to, uint256 _value) public isUserAbleToTransferCheck returns (bool) {
    uint256 aug1st = 1533090000000;
    require(_to != address(0));
    require(_value <= balances[msg.sender]);
    if (paused == true) {
      if (now < aug1st) {
        if (msg.sender !== owner) {
            revert();
        }
      }
    }


    // ADDED LINE <----------------------------------------------------

    // SafeMath.sub will throw if there is not enough balance.
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  function burn() public onlyOwner returns (bool) {
    uint remainingTokens = balanceOf(owner);
    require(remainingTokens>0);
    balances[owner] = 0;
    return true;
  }

//   //One time distribute tokens
//   function distributeTokensToFounder() public onlyOwner whenPaused returns (bool){
//       assert(!isDistributeToFounders);
//       uint256 remainingTokens = balanceOf(owner);
//       require(remainingTokens>0);
//       uint256 percentForFounders=(15 * remainingTokens) / 100;
//       transferByOwnerContract(founderReserve,percentForFounders);
//       transferByOwnerContract(companyReserve,percentForFounders);
//       isDistributeToFounders=true;
//       balances[owner] = 0; //burn all owners remaining tokens
//   }
  //Only owner will initiate transfer during sale
   function transferByOwnerContract(address _to, uint256 _value) public onlyOwner returns (bool) {
    require(_to != address(0));
    require(_value <= balances[msg.sender]);

    // SafeMath.sub will throw if there is not enough balance.
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public constant returns (uint256 balance) {
    return balances[_owner];
  }

}
/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender) public constant returns (uint256);
  function transferFrom(address from, address to, uint256 value) public returns (bool);
  function approve(address spender, uint256 value) public returns (bool);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract StandardToken is ERC20, BasicToken {

  mapping (address => mapping (address => uint256)) internal allowed;

  
  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _value) public isUserAbleToTransferCheck returns (bool) {
    require(_to != address(0));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   *
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifying the amount of tokens still available for the spender.
   */
  function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }

  /**
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   */
  function increaseApproval (address _spender, uint _addedValue) public returns (bool success) {
    allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
    Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  function decreaseApproval (address _spender, uint _subtractedValue) public returns (bool success) {
    uint oldValue = allowed[msg.sender][_spender];
    if (_subtractedValue > oldValue) {
      allowed[msg.sender][_spender] = 0;
    } else {
      allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
    }
    Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

}


contract DeedCoin is StandardToken {
    string public constant name = "DeedCoinTestO";
    uint public constant decimals = 18;
    string public constant symbol = "DEEDTO";

    function DeedCoin()  public {
      totalSupply=80000000 *(10**decimals);  // 
       owner = msg.sender;
       companyReserve=0x4316E2A2160356f4848085242f47B0D889B4F901; //TODO change with deedcoin admin provided address
       founderReserve=0xF605D265878BF8323268C45690A79e1e1D5e581B;//TODO change with client address provided address
       balances[msg.sender] = 56000000 * (10**decimals);
       balances[companyReserve] = 12000000 * (10**decimals); //given by customer
       balances[founderReserve] = 12000000 * (10**decimals);
    }

    function() public {
       revert();
    }

}