pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        uint approvalCount;
        mapping(address => bool) approvals;
        bool complete;
    }
    
    address public manager;
    uint public minContribution;
    mapping(address => bool) public approvers;
    Request[] public requests;
    uint public approversCount;
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    constructor(uint minimum, address creator) public {
        manager = creator; 
        minContribution = minimum;
    }
    
    function contribute() public payable {
        require(msg.value > minContribution);
        
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    function createRequest(string description, uint value, address recipient)
        public restricted {
        Request memory newRequest = Request({
            description: description,
            value: value,
            approvalCount: 0,
            recipient: recipient,
            complete: false
        });
        requests.push(newRequest);
    }
    
    function approveRequest(uint requestIndex) public {
        Request storage request = requests[requestIndex];
        
        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }
    
    function finalizeRequest(uint requestIndex) public restricted {
        Request storage request = requests[requestIndex];
        
        require(request.approvalCount > approversCount / 2);
        require(!request.complete);
        
        request.recipient.transfer(request.value);
        request.complete = true;
    }
}