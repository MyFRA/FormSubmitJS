class FormSubmitJS {
    options;
    obj_key_and_name_source_element;
    arr_form_data = [];
    formData = new FormData();

    constructor(options, obj_key_and_name_source_element) {
        this.options = options;
        this.obj_key_and_name_source_element = obj_key_and_name_source_element;

        this.generateFormData();

        this.appendFormData();
    }

    generateFormData() {
        for (const key in this.obj_key_and_name_source_element) {
            if (Object.hasOwnProperty.call(this.obj_key_and_name_source_element, key)) {
                this.doAppendToFormData(key);
            }
        }

        return this;
    }

    doAppendToFormData(key) {
        let name_element = this.obj_key_and_name_source_element[key];
        if (typeof name_element == 'function') {
            let value = name_element();

            this.addArrFormDataValue(key, value);
        } else if (typeof name_element == 'object') {
            let { type, value } = name_element;

            if (type == 'array') {
                let firstValue = value[Object.keys(value)[0]];
                let amountElements = document.getElementsByName(firstValue).length;
                let values = [];

                for (let i = 0; i < amountElements; i++) {
                    let objItem = {};
                    for (const keyValue of Object.keys(value)) {
                        let inputElement = document.getElementsByName(value[keyValue])[i];
                        objItem[keyValue] = this.getValueFromElement(inputElement);

                        if (keyValue == Object.keys(value)[Object.keys(value).length - 1]) {
                            values.push(objItem)
                        }
                    }
                }

                this.addArrFormDataValue(key, JSON.stringify(values));
            }
        } else {
            let inputElements = document.getElementsByName(name_element);

            if (inputElements.length > 1) {

                let arr_values = [];
                inputElements.forEach((inputElement) => {
                    if (!inputElement) {
                        return
                    } else if (!['SELECT', 'INPUT'].includes(inputElement.tagName)) {
                        return
                    } else {
                        arr_values.push(this.getValueFromElement(inputElement));
                    }
                });

                if (arr_values.length == 1) {
                    arr_values = arr_values[0];
                }

                this.addArrFormDataValue(key, arr_values);

            } else {
                let inputElement = inputElements[0];

                if (!inputElement) {
                    return
                } else if (!['SELECT', 'INPUT', 'TEXTAREA'].includes(inputElement.tagName)) {
                    return
                } else {
                    if (inputElement.tagName == 'INPUT' && inputElement.type == 'file') {
                        if (!inputElement.files[0]) {
                            return;
                        }
                    }
                    this.addArrFormDataValue(key, this.getValueFromElement(inputElement));
                }
            }
        }
    }

    addArrFormDataValue(key, value) {
        let obj = {};
        obj[key] = value;
        this.arr_form_data.push(obj);
    }

    getValueFromElement(inputElement) {
        if (inputElement.tagName == 'INPUT' && inputElement.type == 'file') {
            return inputElement.files[0] ? inputElement.files[0] : '';
        } else if (['SELECT', 'INPUT', 'TEXTAREA'].includes(inputElement.tagName)) {
            return inputElement.value;
        }
    }

    appendFormData() {
        this.arr_form_data.forEach((form_data) => {
            this.formData.append(Object.keys(form_data)[0], form_data[Object.keys(form_data)[0]]);
        });

        return this;
    }

    getFormData() {
        let form_data_obj = {};
        this.arr_form_data.forEach((form_data) => {
            form_data_obj[Object.keys(form_data)[0]] = form_data[Object.keys(form_data)[0]];
        });

        return form_data_obj;
    }

    submit(callback) {
        fetch(this.options.url, {
            method: this.options.method,
            body: this.formData,
            mode: 'cors',
        }).then((res) => {
            if (!res.ok) {
                res.text().then((json_errs) => {
                    return callback(JSON.parse(json_errs), null);
                });

                return false;
            } else {
                return res.json();
            }
        }).then((response) => {
            if (response) {
                return callback(null, response);
            }
        });
    }

    bootstrapHandleError(errs, err_keyElement_and_message) {

        for (const idElement in err_keyElement_and_message) {
            if (Object.hasOwnProperty.call(err_keyElement_and_message, idElement)) {
                const inputElement = document.getElementById(idElement);
                const keyErrorMessage = err_keyElement_and_message[idElement];

                if (typeof keyErrorMessage == 'object') {
                    let newKeyErrorMessage = keyErrorMessage.key;
                    let errorFunction = keyErrorMessage.error;

                    if (errs[newKeyErrorMessage]) {
                        errorFunction(newKeyErrorMessage, Array.isArray(errs[newKeyErrorMessage]) ? errs[newKeyErrorMessage][0] : errs[newKeyErrorMessage]);
                    }
                } else {
                    if (errs[keyErrorMessage]) {
                        if (['INPUT', 'TEXTAREA'].includes(inputElement.tagName)) {
                            !inputElement.classList.contains('is-invalid') ? inputElement.classList.add('is-invalid') : '';

                            if (!inputElement.nextElementSibling) {
                                inputElement.parentElement.insertAdjacentHTML('beforeend',
                                    `<div class="invalid-feedback">${Array.isArray(errs[keyErrorMessage]) ? errs[keyErrorMessage][0] : errs[keyErrorMessage]}</div>`);
                            }
                        }
                    }
                }
            }
        }
    }
}
