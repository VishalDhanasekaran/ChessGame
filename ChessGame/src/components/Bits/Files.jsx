import './Files.css'
import { getChar } from '../../helper'
import { useAppContext } from '../../contexts/Context'

const Files = ({files}) => {
    const { appState } = useAppContext();
    const { boardFlipped } = appState;
    
    // If board is flipped, reverse the files order
    const displayFiles = boardFlipped ? [...files].reverse() : files;
    
    return (
        <div className="File">
            {displayFiles.map(file => <span key={file}>{getChar(file)}</span>)}
        </div>
    )
}
export default Files;