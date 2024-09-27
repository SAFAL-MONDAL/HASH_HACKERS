// contracts/DecentralizedFileStorage.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedFileStorage {

    struct File {
        string fileName;
        string fileHash; // IPFS hash
        address uploader;
    }

    mapping(uint => File) public files;
    uint public fileCount = 0;

    event FileUploaded(uint fileId, string fileName, string fileHash, address uploader);

    function uploadFile(string memory _fileName, string memory _fileHash) public {
        fileCount++;
        files[fileCount] = File(_fileName, _fileHash, msg.sender);
        emit FileUploaded(fileCount, _fileName, _fileHash, msg.sender);
    }

    function getFile(uint _fileId) public view returns (string memory, string memory, address) {
        File memory file = files[_fileId];
        return (file.fileName, file.fileHash, file.uploader);
    }
}
