class RenderDecorator{
    constructor(render_object, param_object){
        this.view = {page: '', data: {}};
        this.view.page = render_object.page;
        Object.assign(this.view.data, this.addDataMembers(render_object, param_object));
    }
  
    addDataMembers(render_object, param_object){
        var new_data = param_object;
        new_data.user_id = render_object.user_id;
        new_data.username = render_object.username;
        new_data.editor = render_object.editor;
        return new_data;
    }

    view(){
        return this.view;
    }
  
    page(){
        return this.view.page;
    }
  
    data(){
        return this.view.data;
    }
};

RenderObject = function(page, req){
    this.page = page;
    this.user_id = req.session.userID;
    this.username = req.session.username;
    this.editor = req.session.isEditor;
  
    return this;
}

module.exports = { RenderObject, RenderDecorator };