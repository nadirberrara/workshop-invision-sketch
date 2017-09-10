// This internal script runs the Sketch API's own unit tests.
// It adds some formatting to the output and then logs it as a JSON dictionary.
// Sketch can then turn that back from JSON to an NSDictionary and pull out the information it needs.

var sketch = context.api();
var result = sketch.runUnitTests();
var description = result['ran'] + " unit tests ran.\n"
description += result['passes'].length + " tests passed.\n"
var failures = result['failures']
if (failures.length > 0) {
  description += failures.length + " tests failed:\n"
  for (var n in failures) {
    var failure = failures[n]
    description += "\n- " + failure['name']
    var reasons = failure['reasons']
    for (r in reasons) {
      var reason = reasons[r]
      description += "\n    " + reason
    }
  }
}
result['description'] = description;
print(JSON.stringify(result))
