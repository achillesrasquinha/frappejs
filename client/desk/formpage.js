const Page = require('frappejs/client/view/page');
const view = require('frappejs/client/view');
const frappe = require('frappejs');

module.exports = class FormPage extends Page {
    constructor(doctype) {
        let meta = frappe.getMeta(doctype)
        super({title: `Edit ${meta.name}`});
        this.meta = meta;
        this.doctype = doctype;

        this.form = new (view.getFormClass(doctype))({
            doctype: doctype,
            parent: this.body,
            container: this,
            actions: ['submit', 'delete', 'duplicate', 'settings']
        });

        this.on('show', async (params) => {
            await this.showDoc(params.doctype, params.name);
            if (frappe.desk.center && !frappe.desk.center.activePage) {
                frappe.desk.showListPage(doctype);
            }
        });

        // if name is different after saving, change the route
        this.form.on('submit', async (params) => {
            let route = frappe.router.get_route();
            if (this.form.doc.name && !(route && route[2] === this.form.doc.name)) {
                await frappe.router.setRoute('edit', this.form.doc.doctype, this.form.doc.name);
                this.form.showAlert('Added', 'success');
            }
        });

        this.form.on('delete', async (params) => {
            this.hide();
            await frappe.router.setRoute('list', this.form.doctype);
        });
    }

    async showDoc(doctype, name) {
        try {
            await this.form.setDoc(doctype, name);
            this.setActiveListRow(name);
        } catch (e) {
            this.renderError(e.status_code, e.message);
        }
    }

    setActiveListRow(name) {
        if (frappe.desk.pages.lists[this.doctype]) {
            frappe.desk.pages.lists[this.doctype].list.setActiveListRow(name);
        }
    }
}
