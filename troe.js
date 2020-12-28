class TROEEManager {
    //bank: {}, // objects to be acted upon are stored in here, in there choosen object type,

    constructor(lookup_field = "", bank_name = "", field_include = [], callbacks = {}) {
        this.callbacks = { // mapping of action and their respective callback to be applied
            'edit': () => { },
            'save': () => { },
            ...callbacks
        }
        this.seen_troees = [] // holds all the initiated TROEElements
        this.troee_in_edit = undefined // a way to keep track of a troee being edited, until we find better
        this.lookup_field = lookup_field
        this.bank_name = bank_name
        this.field_include = field_include
    }


    retrieveSeenTROEElement = (lookup_value) => {
        return this.seen_troees.find(e => e.lookup_value == lookup_value)
    }

    act = (DElement, action) => {
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
        TROEEMnager.predefs[action](troeElement)
    }

    predefs = {
        // predefined functions to use as actions
        // "edit": (troeelement) => {
        //     if (!(troeelement instanceof TROEElement)) throw 'Not a TROEElement'
        //     else {
        //         // only edit if there is no other troee being edited
        //         if (!TROEEMnager.troee_in_edit) {
        //             // replace all the value with their respective input value
        //             Array.from(troeelement._parent_row.children).forEach(cell => {
        //                 // if the input type is not specified correctly or not specified at all, ignore!
        //                 if (cell.dataset.hasOwnProperty("troeInputType")) {
        //                     let tmp_value = cell.innerText

        //                     // input type
        //                     let input_type = cell.dataset["troeInputType"]
        //                     cell.innerHTML = `
        //                     <input type=${input_type} placeholder="${cell.troeField}" value="${tmp_value}" 
        //                     data-troe-lookup-value="${troeelement.lookup_value}" 
        //                     data-troe-bank-name="${troeelement.bank_name}" 
        //                     data-troe-field="${cell.dataset["troeField"]}" 
        //                     oninput="TROEEMnager.predefs.updateTroeelementFieldValue(this)" />`
        //                 }

        //             })
        //             TROEEMnager.troee_in_edit = troeelement
        //             TROEEMnager.predefs.addSaveChangesButton(troeelement)
        //             TROEEMnager.predefs.addCancelEditButton(troeelement)
        //         } else {
        //             TROEEMnager.troee_in_edit._parent_row.style.backgroundColor = "#ff000042"
        //             alert("Please finish editing the the highlithed element first")
        //         }
        //     }
        // },
        // "updateTroeelementFieldValue": (input) => {
        //     /** updates TROEEelemt field value as we go */
        //     let troeelement = TROEEMnager.retrieveSeenTROEElement(input.dataset["troeLookupValue"], input.dataset["troeBankName"])
        //     troeelement.obj[input.dataset["troeField"]] = input.value
        // },
        // "render": (troeelement) => {
        //     // re-render a TROEElement based on its obj attribute
        //     for (attr in troeelement.obj) {
        //         Array.from(troeelement._parent_row.children).find(td => td.dataset["troeField"] == attr).innerText = troeelement.obj[attr]
        //     }
        // },
        "addCancelEditButton": (troeelement) => {
            // adds a cancel button that returns the row to normal state if clicked

            if (!(troeelement instanceof TROEElement)) throw 'Not a TROEElement'
            else {
                troeelement.initiator.parentNode.insertAdjacentHTML('beforeEnd', `<button class="btn btn-warning btn-xs troe-action-cancel-edit" type="button" onclick="TROEEMnager.predefs.cancelEdit(this, '${troeelement.lookup_value}',  '${troeelement.bank_name}')"><span class="fa fa-ban"></span>   Cancel</button>`)

            }
        },
        "addSaveChangesButton": (troeelement) => {
            // adds a cancel button that returns the row to normal state if clicked

            if (!(troeelement instanceof TROEElement)) throw 'Not a TROEElement'
            else {
                troeelement.initiator.parentNode.insertAdjacentHTML('beforeEnd', `<button class="btn btn-success btn-xs troe-action-save" type="button" onclick="TROEEMnager.predefs.saveChanges(this, '${troeelement.lookup_value}',  '${troeelement.bank_name}')"><span class="fa fa-save"></span>   Save</button>`)

            }
        },
        "cancelEdit": (btn, lookup_value, bank_name) => {
            let troeelement = TROEEMnager.retrieveSeenTROEElement(lookup_value, bank_name)
            TROEEMnager.predefs.render(troeelement)
            // can find the save buton and remove it
            let btnSave = Array.from(btn.parentElement.children).find(e => Array.from(e.classList).indexOf("troe-action-save") != -1)
            btnSave.remove()
            btn.remove()
            TROEEMnager.troee_in_edit._parent_row.style.backgroundColor =  // just in case
                TROEEMnager.troee_in_edit = undefined
        },
        "saveChanges": (btn) => {
            /**
             * Just a wrapper that alllows recollecting the TROEElement
             * to render
             */
            let updatedTroeelement = new TROEElement(btn, save = false)

            // get the one having the same lookup value as this one
            let toRender = TROEEMnager.retrieveSeenTROEElement(updatedTroeelement.lookup_value, updatedTroeelement.bank_name)
            TROEEMnager.predefs.render(toRender)

            // find btn cancel
            let btnCancel = Array.from(btn.parentElement.children).find(e => Array.from(e.classList).indexOf("troe-action-cancel-edit") != -1)
            btnCancel.remove()
            btn.remove()

            // apply callback
            TROEEMnager.callbacks['save'](toRender)

            // return the updated TROEElement and can be used to update database
            return toRender
        }
    }

    create = (DElement) => {
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
        // console.log(DElement)
        let troeelement = new TROEElement(DElement, this)
        this.seen_troees.push(troeelement)
        return troeelement
    }
}


class TROEElement {
    /********  parent tree structure: table->tbody->tr->td ********************/
    constructor(DElement, manager) {

        // this.initiator = DElement;
        // this.manager = manager
        // // once the initiator is gotten, we move to get the row and we have the lookup value
        // // the row is expected at level 2 of parent tree
        // this._parent_row = DElement.parentNode.parentElement
        // this.lookup_value = this._parent_row.dataset["troeLookupValue"]

        // // then the table itself, to get the bank and lookup field
        // // the parent is also expected at level 2 of parent tree(table->tbody->tr->td)
        // this._parent_table = this._parent_row.parentElement.parentElement
        // this.bank_name = this._parent_table.dataset["troeBank"]
        // this.lookup_field = this._parent_table.dataset["troeLookup"]

        // /**
        //  * Object represetation
        //  * loop through each cell of parent row to collect attributes and values 
        //  * of the object that are TROE editable
        //  */
        // let _obj = {}
        // Array.from(this._parent_row.children).forEach(td => {
        //     // collect those with data-troe-field
        //     if (td.dataset.hasOwnProperty("troeField")) {
        //         _obj[td.dataset["troeField"]] = td.innerText
        //     }
        // })
        this.obj = {}
        this.manager = manager

        // only include thos listed inside manager.field_include
        for (let f in DElement) {
            if (this.manager.field_include.indexOf(f) != -1) this.obj[f] = DElement[f]
        }


        this.lookup_value = this.obj[this.manager.lookup_field]
        this.manager_name = undefined
    }

    locate() {
        // completes object's data that allows locating where it is represented
        // once the initiator is gotten, we move to get the row and we have the lookup value
        // the row is expected at level 2 of parent tree
        this._parent_row = document.querySelector(`#${this.manager.bank_name}-${this.lookup_value}`)

        // the last cell has the actions
        this.actionCell = this._parent_row.lastElementChild

        // then the table itself, to get the bank and lookup field
        // the parent is also expected at level 2 of parent tree(table->tbody->tr->td)
        this._parent_table = this._parent_row.parentElement.parentElement
    }

    HTMLRow(managerName) {
        this.manager_name = managerName
        let html = `
        <tr data-troe-lookup-value="${this.manager.lookup_field}" id="${this.manager.bank_name}-${this.lookup_value}">`
        for (let field in this.obj) {
            html += `<td data-troe-input-type="text" data-troe-field="${field}">${this.obj[field]}</td>`
        }
        // working 
        html += `
            <td>
                <button class="btn btn-warning btn-xs troe-action-edit" type="button" onclick="${managerName}.retrieveSeenTROEElement('${this.lookup_value}').edit()"><span class="fa fa-edit"></span>   Edit</button>
                <button class="btn btn-danger btn-xs" type="button"><span class="fa fa-trash-o"></span>   Delete</button>
            </td>
        </tr>`

        return html
    }

    edit() {
        this.locate()

        Array.from(this._parent_row.children).forEach(cell => {
            // if the input type is not specified correctly or not specified at all, ignore!
            if (cell.dataset.hasOwnProperty("troeInputType")) {
                let tmp_value = cell.innerText

                // input type
                let input_type = cell.dataset["troeInputType"]
                cell.innerHTML = `
                <input type=${input_type} placeholder="${cell.troeField}" value="${tmp_value}" 
                data-troe-lookup-value="${this.lookup_value}" 
                data-troe-bank-name="${this.bank_name}" 
                data-troe-field="${cell.dataset["troeField"]}" 
                oninput="${this.manager_name}.retrieveSeenTROEElement('${this.lookup_value}').updateTroeelementFieldValue(this)" />`
            }

        })
        this.addSaveChangesButton()
        this.addCancelEditButton()
    }

    updateTroeelementFieldValue(input) {
        /** updates TROEEelemt field value as we go */
        this.obj[input.dataset["troeField"]] = input.value
    }

    render(){
        for (let attr in this.obj) {
            Array.from(this._parent_row.children).find(td => td.dataset["troeField"] == attr).innerText = this.obj[attr]
        }
    }



    addSaveChangesButton() {
        this.actionCell.insertAdjacentHTML('beforeEnd', `<button class="btn btn-success btn-xs troe-action-save" type="button" onclick="${this.manager_name}.retrieveSeenTROEElement('${this.lookup_value}').saveChanges(this)"><span class="fa fa-save"></span>   Save</button>`)
    }

    addCancelEditButton() {
        //  let's do anything for now cause we do not know how to return previous value
        //  since we modify the value oninput
        //  this.actionCell.insertAdjacentHTML('beforeEnd', `<button class="btn btn-warning btn-xs troe-action-cancel-edit" type="button" onclick="TROEEMnager.predefs.cancelEdit(this, '${this.lookup_value}',  '${this.bank_name}')"><span class="fa fa-ban"></span>   Cancel</button>`)
    }

    saveChanges(btn){
            /**
             * Just a wrapper that alllows recollecting the TROEElement
             * to render
             */
            // let updatedTroeelement = new TROEElement(btn, save = false)

            // // get the one having the same lookup value as this one
            // let toRender = TROEEMnager.retrieveSeenTROEElement(updatedTroeelement.lookup_value, updatedTroeelement.bank_name)
            // TROEEMnager.predefs.render(toRender)

            

            // // apply callback
            // TROEEMnager.callbacks['save'](toRender)

            // // return the updated TROEElement and can be used to update database
            // return toRender
            this.render()
            // find btn cancel
            // let btnCancel = Array.from(btn.parentElement.children).find(e => Array.from(e.classList).indexOf("troe-action-cancel-edit") != -1)
            // btnCancel.remove()
            btn.remove()
            // // apply callback
            // TROEEMnager.callbacks['save'](toRender)
            this.manager.callbacks['save'](this.obj)
    }
}
