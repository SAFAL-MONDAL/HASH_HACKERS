// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract FileStorage {
    struct FileDetails {
        string ipfsHash;
        address uploader;
        uint256 timestamp;
    }

    event FileUploaded(string ipfsHash, address uploader, uint256 timestamp);
    mapping(address => FileDetails[]) public filesByUploader;

    function uploadFile(string memory _ipfsHash) public {
        FileDetails memory newFile = FileDetails({
            ipfsHash: _ipfsHash,
            uploader: msg.sender,
            timestamp: block.timestamp
        });

        filesByUploader[msg.sender].push(newFile);
        emit FileUploaded(_ipfsHash, msg.sender, block.timestamp);
    }

    function getFilesByUploader(address _uploader) public view returns (FileDetails[] memory) {
        return filesByUploader[_uploader];
    }
}
