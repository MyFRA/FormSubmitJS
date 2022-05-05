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
                let name_element = this.obj_key_and_name_source_element[key];
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

                    if( arr_values.length == 1 ) {
                        arr_values = arr_values[0];
                    }

                    this.addArrFormDataValue(key, arr_values);

                } else {
                    let inputElement = inputElements[0];

                    if (!inputElement) {
                        return
                    } else if (!['SELECT', 'INPUT'].includes(inputElement.tagName)) {
                        return
                    } else {
                        this.addArrFormDataValue(key, this.getValueFromElement(inputElement));
                    }
                }
            }
        }

        return this;
    }

    addArrFormDataValue(key, value) {
        let obj = {};
        obj[key] = value;
        this.arr_form_data.push(obj);
    }

    getValueFromElement(inputElement) {
        if (inputElement.tagName == 'INPUT' && inputElement.type == 'file') {
            return inputElement.files[0] ? inputElement.files[0] : null;
        } else if(['SELECT', 'INPUT'].includes(inputElement.tagName)) {
            return inputElement.value;
        }
    }

    appendFormData() {
        this.arr_form_data.forEach((form_data) => {
            let { key, value } = { form_data };

            this.formData.append(key, value);
        });

        return this;
    }

    getFormData() {
        return this.arr_form_data;
    }

    submit(callback) {
        fetch(this.options.url, {
            method: this.options.method,
            body: this.formData,
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
            if( response ) {
                return callback(null, response);
            }
        });
    }
}
