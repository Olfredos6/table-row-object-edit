class TROEEManager {
    //bank: {}, // objects to be acted upon are stored in here, in there choosen object type,

    constructor(lookup_field = "", bank_name = "", field_include = [], callbacks = {}, select_fields = {}, custom_buttons=[]) {
        /**
         * select_fields is fomed the following way:
         * {'attr_name': [
         *      a callback function returning the object to call for data or array to loop through, 
         *      attribute to use as display, 
         *      attribute to use as value
         * ]
         * }
         */
        this.callbacks = { // mapping of action and their respective callback to be applied
            'edit': () => { },
            'update': () => { },
            'addRow': () => { },
            'save': () => { },
            ...callbacks,
        }
        this.seen_troees = [] // holds all the initiated TROEElements
        this.troee_in_edit = undefined // a way to keep track of a troee being edited, until we find better
        this.lookup_field = lookup_field
        this.bank_name = bank_name
        this.field_include = field_include
        this.select_fields = select_fields
        this.custom_buttons = custom_buttons // a list of html for any custom button
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
        if (!this.seen_troees.find(t => t.lookup_value == DElement[this.lookup_field])) this.seen_troees.push(troeelement)
        return troeelement
    }

    createRow() {
        // create an empty lement then render it
        // steal fields from manager.field_include
        const newEmptyObj = {}
        this.field_include.forEach(f => {
            newEmptyObj[f] = null
        })

        let newTROEElement = this.create(newEmptyObj)
        newTROEElement.render()
    }

    emptyObject() {
        // returns an object with empty field depending on the object that this manages
        const newEmptyObj = {}
        this.field_include.forEach(f => {
            newEmptyObj[f] = ""
        })
        return newEmptyObj
    }

    addRow() {
        this.callbacks['addRow']()
    }
}


class TROEElement {
    /********  parent tree structure: table->tbody->tr->td ********************/
    constructor(DElement, manager) {
        this.obj = {}
        this.manager = manager

        // only include thos listed inside manager.field_include
        for (let f in DElement) {
            /*if (this.manager.field_include.indexOf(f) != -1)*/ this.obj[f] = DElement[f]
        }

        // create initial obj which should never be edited
        this._initial_obj = this.obj


        this.lookup_value = this.obj.hasOwnProperty(this.manager.lookup_field) ? this.obj[this.manager.lookup_field] : ""
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
            if (this.manager.field_include.indexOf(field) != -1) {
                html += `<td data-troe-input-type="text" data-troe-field="${field}">${this.obj[field]}</td>`
                // // check if filed is of type select else give it a type text
                // if(!this.manager.select_fields.hasOwnProperty(field))
                //     html += `<td data-troe-input-type="text" data-troe-field="${field}">${this.obj[field]}</td>`
                // else{
                //     let selectOptions = `<select name="${field}">`
                //     let select_configs = this.manager.select_fields[field]

                //     select_configs[0]().forEach(obj=>{
                //         selectOptions += `<option value="${obj[select_configs[2]]}">${obj[select_configs[1]]}</option>`
                //     })
                //     selectOptions += "</select>"
                //     html += `<td data-troe-input-type="text" data-troe-field="${field}">${selectOptions}</td>`
                // }
            }
        }
        // we first add custom butons if any
        html += `<td>`
        this.manager.custom_buttons.forEach(btn => {
            html += btn
        })
        html += `
                <button class="btn btn-warning btn-xs troe-action-edit" type="button" onclick="${managerName}.retrieveSeenTROEElement('${this.lookup_value}').edit()"><span class="fa fa-edit"></span>   Edit</button>
                <button class="btn btn-danger btn-xs troe-action-delete" type="button"><span class="fa fa-trash-o"></span>   Delete</button>
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
                // check if filed is of type select else give it a type text
                let fieldName = cell.dataset["troeField"]
                if (!this.manager.select_fields.hasOwnProperty(fieldName)) {
                    let input_type = cell.dataset["troeInputType"]
                    cell.innerHTML = `
                    <input type=${input_type}
                    value="${tmp_value}" 
                    data-troe-lookup-value="${this.lookup_value}" 
                    data-troe-bank-name="${this.bank_name}" 
                    data-troe-field="${fieldName}" 
                    oninput="${this.manager_name}.retrieveSeenTROEElement('${this.lookup_value}').updateTroeelementFieldValue(this)" 
                    placeholder="${fieldName}"
                    />`
                }
                else {
                    
                    let selectOptions = `
                    <select name="${fieldName}"
                    data-troe-lookup-value="${this.lookup_value}" 
                    data-troe-bank-name="${this.bank_name}" 
                    data-troe-field="${fieldName}"
                    onchange="${this.manager_name}.retrieveSeenTROEElement('${this.lookup_value}').updateTroeelementFieldValue(this)" 
                    placeholder="${fieldName}"
                    >`
                    let select_configs = this.manager.select_fields[fieldName]

                    let has_set_default_option = false
                    select_configs[0]().forEach(obj => {
                        // need to set the first option
                        if(!has_set_default_option) this.obj[fieldName] = obj[select_configs[2]]
                        selectOptions += `<option value="${obj[select_configs[2]]}">${obj[select_configs[1]]}</option>`
                    })
                    selectOptions += "</select>"
                    cell.innerHTML = selectOptions
                }
            }

        })
        this.addSaveChangesButton()
        this.addCancelEditButton()
    }

    cancelEdit(btn) {
        // uses this._initial_obj to revert to initial value
        this.render(true)

        // remove all butons except edit and delete
        Array.from(this.actionCell.children).forEach(btn => {
            if (!(btn.classList.contains("troe-action-edit") || btn.classList.contains("troe-action-delete"))) {
                btn.remove()
            }
        })
        // can find the save buton and remove it
        // let btnSave = Array.from(btn.parentElement.children).find(e => Array.from(e.classList).indexOf("troe-action-save") != -1)
        // btnSave.remove()
        // btn.remove()
        // this.actionCell.
        // TROEEMnager.troee_in_edit._parent_row.style.backgroundColor =  // just in case
        //     TROEEMnager.troee_in_edit = undefined
    }

    updateTroeelementFieldValue(input) {
        /** updates TROEEelemt field value as we go */
        this.obj[input.dataset["troeField"]] = input.value
    }

    render(initial = false) {
        let o = initial ? this._initial_obj : this.obj
        for (let attr in o) {
            if (this.manager.field_include.indexOf(attr) != -1)
                Array.from(this._parent_row.children).find(td => td.dataset["troeField"] == attr).innerText = o[attr]
        }
    }



    addSaveChangesButton() {
        // if lookup_value is "", we asume object has no been saved to db yet, hence, create insted of save
        if (this.lookup_value === "") {
            this.actionCell.insertAdjacentHTML('beforeEnd', `<button class="btn btn-primary btn-xs troe-action-create" type="button" onclick="${this.manager_name}.retrieveSeenTROEElement('${this.lookup_value}').save(this)"><span class="fa fa-save"></span>   Create</button>`)
        }
        else {
            this.actionCell.insertAdjacentHTML('beforeEnd', `<button class="btn btn-success btn-xs troe-action-save" type="button" onclick="${this.manager_name}.retrieveSeenTROEElement('${this.lookup_value}').update(this)"><span class="fa fa-save"></span>   Save</button>`)
        }

    }

    addCancelEditButton() {
        this.actionCell.insertAdjacentHTML('beforeEnd', `<button class="btn btn-default btn-xs troe-action-cancel-edit" type="button" onclick="${this.manager_name}.retrieveSeenTROEElement('${this.lookup_value}').cancelEdit(this)"><span class="fa fa-ban"></span>   Cancel</button>`)
    }

    update(btn) {
        this.render()
        btn.remove()
        this.manager.callbacks['update'](this.obj)
    }

    save() {
        this.manager.callbacks["save"](this.obj)
    }
}
