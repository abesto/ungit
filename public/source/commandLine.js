
var ko = require('../vendor/js/knockout-2.2.1');


var CommandLineViewModel = function(path) {
    var self = this;
    this.path = path;
    this.hasFocus = ko.observable(true);
    this.command = ko.observable();
}
exports.CommandLineViewModel = CommandLineViewModel;
CommandLineViewModel.prototype.template = 'commandLine';
CommandLineViewModel.prototype.call = function() {
    var command = this.command();
    this.command('');
    return this[command]();
}
CommandLineViewModel.prototype.commit = function() {
    this.path.repository().staging.commitMessageTitleFocused(true);
}