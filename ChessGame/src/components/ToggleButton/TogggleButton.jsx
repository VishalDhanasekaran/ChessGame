
const ToggleButton = (props) => {
    
    return(
    <div>
        <button onClick={() => {props.returnOption((props.def === "White")?"Black":"White")} } >
            {props.def}
        </button>

    </div>
    )
}
export default ToggleButton;