$(function() {
   $('input').filter('.datepicker').datepicker();
});

new Vue({
   el: '#app',

   data: {
      date_from: null,
      date_to: null,
      timeline_dataset: null
   },

   methods: {
      click: function() {
         var self = this
         //if (self.date_from == null || self.date_to == null || self.date_from > self.date_to)
           // return

         var request = new XMLHttpRequest();

         request.open("POST", "/timeline-data", true);
         request.onreadystatechange = function(rep) {
            if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
               self.timeline_dataset = JSON.parse(rep.srcElement.response)
               self.displayTimeline()
            }
         }
         request.send();
      },

      displayTimeline: function() {
         var self = this
         var container = document.getElementById('timeline-view');

         // Configuration for the Timeline
         var options = {};
         console.log(self.timeline_dataset)

         var items = new vis.DataSet(self.timeline_dataset)
         // Create a Timeline
         var timeline = new vis.Timeline(container, items, options);
      }
   }
});