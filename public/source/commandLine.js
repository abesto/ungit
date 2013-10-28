// Big todo: graph node hasFocus vs. commandLine hasFocus
var ko = require('../vendor/js/knockout-2.2.1');
var $ = require('../vendor/js/jquery-2.0.0.min');


// Will be loaded from config
var aliases = {
    'c': 'commit',
    'p': 'push'
}


var CommandLineViewModel = function(path) {
    var self = this;
    this.path = path;
    this.hasFocus = ko.observable(true);
    this.command = ko.observable();
    this.valid = ko.computed(function() {
        var command = this.applyAliases(this.command());
        if (this.check[command]) return this.check[command].call(this);
        return !!this[command];
    }, this);
    $(document).keypress(function() { self.hasFocus(true); });
    this.command.subscribe(this.show, this);
}
exports.CommandLineViewModel = CommandLineViewModel;
CommandLineViewModel.prototype.template = 'commandLine';
CommandLineViewModel.prototype.applyAliases = function(command) {
    while (aliases[command]) {
        command = aliases[command];
    }
    return command;
}
CommandLineViewModel.prototype.call = function() {
    var command = this.applyAliases(this.command());
    this.command('');
    if (this[command]) return this[command]();
}
CommandLineViewModel.prototype.commit = function() {
    this.path.repository().staging.commitMessageTitleFocused(true);
}
CommandLineViewModel.prototype.push = function() {
    var graph = this.path.repository().graph;
    if (!graph.currentActionContext()) {
        graph.checkedOutRef().hasFocus(true);
    }
    // TODO: get the push actions using filter
    this.path.repository().graph.checkedOutRef().node().dropareaGraphActions[3].doPerform()
}
CommandLineViewModel.prototype.show = function(command) {
    var graph = this.path.repository().graph;
    if (!graph.currentActionContext()) {
        graph.checkedOutRef().hasFocus(true);
    }
    command = this.applyAliases(this.command());

    if (this.show[command]) {
        this.show[command].call(this);
    } else {
        graph.hoverGraphAction(null);
    }
}
CommandLineViewModel.prototype.show.push = function() {
    // TODO: don't do anything if can't push
    var graph = this.path.repository().graph,
                push = graph.currentActionContext().node().dropareaGraphActions[3];
    if (this.check.push.call(this)) graph.hoverGraphAction(push);
}
CommandLineViewModel.prototype.check = {};
CommandLineViewModel.prototype.check.push = function() {
    return this.path.repository().graph.currentActionContext().node().dropareaGraphActions[3].visible();
}
