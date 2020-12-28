const troe = {
    bank: {}, // objects to be acted upon are stored in here, in there choosen object type
    act: (DElement, action) => {
        /**
         * Method used to act on an event on DElement which simply stands for DOM Element.
         * The element is passed to this function and implied to be part of a table's row.
         * 
         * That row is expected to be inside a table possessing the data:
         *      -> troe-bank: referencing the bank property in which to do object lookup
         *      -> troe-lookup: name of the field used to do object lookup
         * 
         * Once that is set, the row itself is required to have:
         *      -> troe-lookup-value: value used when doing object lookup
         * 
         * Each td is expeted to possess the following data: 
         *      -> troe-field: name of the filed being represented here
         *      -> troe-input-type: in case of an edit, which type of input to place there 
         * 
         */
        console.log(DElement)
        let troeElement = new TROEElement(DElement)
        troe.predefs[action](troeElement)
    },

    predefs: {
        // predefined functions to use as actions
        "edit": (troeelement)=>{
            if(!(troeelement instanceof TROEElement)) throw 'Not a TROEElement'
            else {
                // replace all the value with their respective input value
                Array.from(troeelement._parent_row.children).forEach(cell =>{
                    // if the input type is not specified correctly or not specified at all, ignore!
                    if(cell.dataset.hasOwnProperty("troeInputType")){
                        let tmp_value = cell.innerText

                    // input type
                    let input_type = cell.dataset["troeInputType"]
                    cell.innerHTML = `<input type=${input_type} placeholder="${cell.troeField}" value="${tmp_value}" />`
                    }
                    
                })
            }
        }
    }
}

class TROEElement {
    /********  parent tree structure: table->tbody->tr->td ********************/
    constructor(DElement) {

        this.initiator = DElement;

        // once the initiator is gotten, we move to get the row and we have the lookup value
        // the row is expected at level 2 of parent tree
        this._parent_row = DElement.parentNode.parentElement
        this.lookup_value = this._parent_row.dataset["troeLookupValue"]

        // then the table itself, to get the bank and lookup field
        // the parent is also expected at level 2 of parent tree(table->tbody->tr->td)
        this._parent_table = this._parent_row.parentElement.parentElement
        this.bank_name = this._parent_table.dataset["troeBank"]
        this.lookup_field = this._parent_table.dataset["troeLookup"]
    }
}