(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends =   function(child, parent) {
    if (typeof parent.__extend == 'function') return parent.__extend(child);
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } 
    function ctor() { this.constructor = child; } 
    ctor.prototype = parent.prototype; 
    child.prototype = new ctor; 
    child.__super__ = parent.prototype; 
    if (typeof parent.extended == 'function') parent.extended(child); 
    return child; 
};

  App.ProjectUser = (function(_super) {
    var ProjectUser;

    function ProjectUser() {
      return ProjectUser.__super__.constructor.apply(this, arguments);
    }

    ProjectUser = __extends(ProjectUser, _super);

    ProjectUser.field('user', {
      type: 'User'
    });

    ProjectUser.hasMany('projects');

    return ProjectUser;

  })(Tower.Model);

}).call(this);
