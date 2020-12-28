const troe = {
    bank: {}, // objects to be acted upon are stored in here, in there choosen object type,

    seen_troees: [], // holds all the initiated TROEElements

    retrieveSeenTROEElement: (lookup_value, bank_name) => { return troe.seen_troees.find(e => e.lookup_value == lookup_value && e.bank_name == bank_name )},

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
                troe.predefs.addSaveChangesButton(troeelement)
                troe.predefs.addCancelEditButton(troeelement)
            }
        },
        "addCancelEditButton": (troeelement) => {
            // adds a cancel button that returns the row to normal state if clicked
            
            if(!(troeelement instanceof TROEElement)) throw 'Not a TROEElement'
            else {
                troeelement.initiator.parentNode.insertAdjacentHTML('beforeEnd', `<button class="btn btn-warning btn-xs" type="button" onclick="troe.predefs.cancelEdit(this, '${troeelement.lookup_value}',  '${troeelement.bank_name}')"><span class="fa fa-ban"></span>   Cancel</button>`)
                
            }
        },
        "addSaveChangesButton": (troeelement) => {
            // adds a cancel button that returns the row to normal state if clicked
            
            if(!(troeelement instanceof TROEElement)) throw 'Not a TROEElement'
            else {
                troeelement.initiator.parentNode.insertAdjacentHTML('beforeEnd', `<button class="btn btn-success btn-xs troe-action-save" type="button" onclick="troe.predefs.saveChanges(this, '${troeelement.lookup_value}',  '${troeelement.bank_name}')"><span class="fa fa-save"></span>   Save</button>`)
                
            }
        },
        "cancelEdit": (btn, lookup_value, bank_name) => {
            troeelement = troe.retrieveSeenTROEElement(lookup_value, bank_name)
            for(attr in troeelement.obj){
                Array.from(troeelement._parent_row.children).find(td => td.dataset["troeField"] == attr).innerText = troeelement.obj[attr]
            }
            // can find the save buton and remove it
            let btnSave = Array.from(btn.parentElement.children).find(e => Array.from(e.classList).indexOf("troe-action-save") != -1 )
            btnSave.remove()
            btn.remove()
            
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

        /**
         * Object represetation
         * loop through each cell of parent row to collect attributes and values 
         * of the object that are TROE editable
         */
        this.obj = {}

        Array.from(this._parent_row.children).forEach(td => {
            // collect those with data-troe-field
            if(td.dataset.hasOwnProperty("troeField")){
                this.obj[td.dataset["troeField"]] = td.innerText
            }
        })

        // add to seen_troees 
        let seen_troee = troe.seen_troees.find(e=> e.lookup_value == this.lookup_value)
        if(!seen_troee)
            troe.seen_troees.push(this)
        else{
            return seen_troee
        }
    }
}

/********************************* events ********************************/
// document.querySelector(".troe-action-edit").addEventListener('click', e => {
//     let troeElement = new TROEElement(e.target)
//     troe.predefs.edit(troeElement)
// })