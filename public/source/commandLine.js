var ko = require('../vendor/js/knockout-2.2.1');
var $ = require('../vendor/js/jquery-2.0.0.min');


// Will be loaded from config
var aliases = {
    'c': 'commit',
    'p': 'push'
};


var CommandLineViewModel = function(path) {
    var self = this;
    this.path = path;
    this.command = ko.observable();
    this.valid = ko.computed(function() {
        var command = this.applyAliases(this.command());
        this.show(command);
        if (this.check[command]) return this.check[command].call(this);
        return !!this[command];
    }, this);
    $(document).keypress(function(e) {
        // Don't refocus if we're in a text input box
        var activeElement = document.activeElement,
            $commandLine = $('.command-line');
        if (activeElement.nodeName == 'TEXTAREA') return;
        if (activeElement.nodeName == 'INPUT' && activeElement.type == 'text') return;
        // The command line will get the character pressed, but obervables
        // won't be updated, since there's no keydown event
        $commandLine.focus();
        // After the command line gets the initial character, force an update
        // (needed to handle single-character aliases)
        setTimeout(function() {
            self.command($commandLine.val());
            self.command.valueHasMutated();
        }, 0);
    });
};
exports.CommandLineViewModel = CommandLineViewModel;
CommandLineViewModel.prototype.template = 'commandLine';
CommandLineViewModel.prototype.applyAliases = function(command) {
    while (aliases[command]) {
        command = aliases[command];
    }
    return command;
};
CommandLineViewModel.prototype.call = function() {
    var command = this.applyAliases(this.command());
    this.command('');
    if (this[command]) return this[command]();
};
CommandLineViewModel.prototype.commit = function() {
    this.path.repository().staging.commitMessageTitleFocused(true);
};
CommandLineViewModel.prototype.push = function() {
    var graph = this.path.repository().graph;
    if (!graph.currentActionContext()) {
        graph.checkedOutRef().hasFocus(true);
    }
    // TODO: get the push actions using filter
    this.path.repository().graph.checkedOutRef().node().dropareaGraphActions[3].doPerform();
};
CommandLineViewModel.prototype.show = function(command) {
    var repository = this.path.repository(),
        graph;
    if (!repository) return false;
    graph = repository.graph;
    if (!graph.checkedOutRef()) return false;
    if (!graph.currentActionContext()) {
        graph.checkedOutRef().selected(true);
    }
    command = this.applyAliases(this.command());

    if (this.show[command]) {
        this.show[command].call(this);
    } else {
        graph.hoverGraphAction(null);
    }

    return true;
};
CommandLineViewModel.prototype.show.push = function() {
    // TODO: don't do anything if can't push
    var graph = this.path.repository().graph,
                push = graph.currentActionContext().node().dropareaGraphActions[3];
    if (this.check.push.call(this)) graph.hoverGraphAction(push);
};
CommandLineViewModel.prototype.check = {};
CommandLineViewModel.prototype.check.push = function() {
    return this.path.repository().graph.currentActionContext().node().dropareaGraphActions[3].visible();
};
