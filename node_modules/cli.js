var cli = {};
cli.List = function() {
    this.lines = [];
    this.colmaxlen = [];
};
cli.List.prototype.newLine = function() {
    this.lines.push([]);
};
cli.List.prototype.addCol = function(s) {
    var row = this.lines.length - 1;
    var col = this.lines[row].length;
    if(col >= this.colmaxlen.length) {
        this.colmaxlen.push(s.length);
    } else if(this.colmaxlen[col] < s.length) {
        this.colmaxlen[col] = s.length;
    }
    this.lines[row].push(s);
};
cli.List.prototype.toString = function() {
    var list = [];
    this.lines.forEach(function(line) {
        var cols = [];
        for(var col = 0; col < line.length; col++) {
            var m = this.colmaxlen[col];
            var s = line[col];
            while(s.length < m) {
                s += ' ';
            }
            cols.push(s);
        }
        list.push(cols.join(' '));
    }, this);
    return list.join("\n");;
};
module.exports = cli;
