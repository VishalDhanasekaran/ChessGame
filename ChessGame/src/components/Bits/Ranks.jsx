import './Ranks.css'

const Ranks = ({ranks}) => {
    return (<div className="Rank">
            { ranks.map( rank => <span key={rank}>{rank}</span>) } 
            </div>)
}
export default Ranks;