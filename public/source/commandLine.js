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
    this.commandLine = ko.observable();
    this.command = ko.computed({
        read: function() { return this.applyAliases(this.commandLine()); },
        write: function(cmd) { this.commandLine(cmd); },
        owner: this
    });
    this.command.subscribe(this.show, this);
    this.valid = ko.computed(function() {
        return this.check(this.command());
    }, this);
    this.currentActionContext = ko.computed(function() {
        if (!this.path.repository()) return null;
        return this.path.repository().graph.currentActionContext();
    }, this);
    this.graph = ko.computed(function() {
        if (!this.path.repository()) return null;
        return this.path.repository().graph;
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
            self.commandLine($commandLine.val());
            self.commandLine.valueHasMutated();
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
    var command = this.command();
    this.command('');
    if (this[command]) return this[command]();
};
CommandLineViewModel.prototype.commit = function() {
    this.path.repository().staging.commitMessageTitleFocused(true);
};
CommandLineViewModel.prototype.push = function() {
    if (this.graph()) this.graph().checkedOutRef().node().dropareaGraphActions[3].doPerform();
};
CommandLineViewModel.prototype.show = function(command) {
    var repository = this.path.repository(),
        graph = this.graph(),
        shouldShow = true;

    if (!repository || !graph || !graph.checkedOutRef) shouldShow = false;
    if (!this.check(command)) shouldShow = false;

    if (shouldShow && this.show[command]) {
        shouldShow = this.show[command].call(this);
    } else if (!shouldShow) {
        graph.hoverGraphAction(null);
    }
};
CommandLineViewModel.prototype.show.push = function() {
    var push = this.currentActionContext().node().dropareaGraphActions[3];
    this.graph().hoverGraphAction(push);
};
CommandLineViewModel.prototype.check = function(command) {
    if (!(command in this)) return false;
    return this.check[command].call(this);
};
CommandLineViewModel.prototype.check.commit = function() { return true; };
CommandLineViewModel.prototype.check.push = function() {
    return this.currentActionContext() && this.currentActionContext().node().dropareaGraphActions[3].visible();
};
