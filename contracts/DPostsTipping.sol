// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.4;

contract DPostsTipping {
    string public name = "DPostsTipping";

    struct Image {
        uint256 id;
        string hash;
        string description;
        uint256 tipAmount;
        address payable author;
    }

    uint256 public imageCount = 0;
    mapping(uint256 => Image) public images;

    event UploadedImage(
        uint256 id,
        string hash,
        string description,
        uint256 tipAmount,
        address payable author
    );

    event TipImageOwner(
        uint256 id,
        string hash,
        uint256 tipAmount,
        address payable author
    );

    function uploadImage(string memory _hash, string memory _description)
        external
    {
        require(msg.sender != address(0x0), "Invalid sender address");
        require(bytes(_hash).length > 0, "Empty hash value");
        require(bytes(_description).length > 0, "Empty description value");

        imageCount++;
        images[imageCount] = Image(
            imageCount,
            _hash,
            _description,
            0,
            msg.sender
        );

        emit UploadedImage(imageCount, _hash, _description, 0, msg.sender);
    }

    function tipImageOwner(uint256 _id) public payable {
        uint256 _tipAmount = msg.value;
        require(msg.sender != address(0x0), "Invalid sender address");
        require(_tipAmount > 0);
        require(_id > 0 && _id <= imageCount);

        Image memory _image = images[_id];
        address payable _author = _image.author;
        _author.transfer(_tipAmount);
        _image.tipAmount += msg.value;
        images[_id] = _image;

        emit TipImageOwner(_id, _image.hash, _tipAmount, _author);
    }
}
