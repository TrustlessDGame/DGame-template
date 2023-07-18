import "@openzeppelin/contracts/utils/Strings.sol";

contract SimpleTicTacToe {
    event ClickEvent(uint256 x, uint256 y, string move);

    string[3][3] public playboard;
    uint256 public totalMove;
    constructor() {

    }

    function Reset() public {
        for (uint256 i = 0; i < 3; i++) {
            for (uint256 j = 0; j < 3; j++) {
                playboard[i][j] = "";
            }
        }
        totalMove = 0;
    }

    function Click(uint256 x, uint256 y, string memory move) public {
        playboard[x][y] = move;
        totalMove ++;
        emit ClickEvent(x, y, move);
    }

    function PlayboardView() public view returns (string memory result) {
        for (uint256 i = 0; i < 3; i++) {
            for (uint256 j = 0; j < 3; j++) {
                if (bytes(playboard[i][j]).length > 0) {
                    {}
                    result = string(abi.encodePacked(result, playboard[i][j], " | "));
                } else {
                    result = string(abi.encodePacked(result, " ", " | "));
                }
            }
            result = string(abi.encodePacked(result, "\n"));
        }

        result = string(abi.encodePacked(result, " \n total ", Strings.toString(totalMove)));
    }
}