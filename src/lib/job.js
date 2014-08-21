/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {
  
  // usage
  
  // invoke cb.call(this) in 100ms, unless the job is re-registered,
  // which resets the timer
  // 
  // this.myJob = this.job(this.myJob, cb, 100)
  //
  // returns a job handle which can be used to re-register a job

  var Job = function(inContext) {
    this.context = inContext;
    var self = this;
    this.boundComplete = function() {
      self.complete();
    };
  };
  Job.prototype = {
    go: function(callback, wait) {
      this.callback = callback;
      var h;
      /* NOTE: a `no wait` job fires at the fastest of setTimeout/raf if
      the page is visible. If the page is not visible setTimeout is always used
      to ensure the job runs. */
      if (!wait && !document.hidden) {
        h = requestAnimationFrame(this.boundComplete);
        var h2 = setTimeout(this.boundComplete, 0);
        this.handle = function() {
          cancelAnimationFrame(h);
          clearTimeout(h2);
        }
      } else {
        h = setTimeout(this.boundComplete, wait || 0);
        this.handle = function() {
          clearTimeout(h);
        }
      }
    },
    stop: function() {
      if (this.handle) {
        this.handle();
        this.handle = null;
      }
    },
    complete: function() {
      if (this.handle) {
        this.stop();
        this.callback.call(this.context);
      }
    }
  };
  
  function job(job, callback, wait) {
    if (job) {
      job.stop();
    } else {
      job = new Job(this);
    }
    job.go(callback, wait);
    return job;
  }
  
  // exports 

  scope.job = job;
  
})(Polymer);
