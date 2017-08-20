new Vue({
   el: '#app',

   data: {
      year_from: 1900,
      year_to: 2000,
      name: null,
      timeline_dataset: null
   },

   methods: {
      click: function() {
         var self = this
         if (self.year_from == null || self.year_to == null || self.year_from > self.year_to || self.name == null || self.name.trim() === '')
            return

			var params = {"from": self.year_from, "to": self.year_to, 'name': self.name.trim()}
         var request = new XMLHttpRequest();

         request.open("POST", "/timeline-data", true);
         request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
         request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
               self.timeline_dataset = JSON.parse(request.responseText)
               self.displayTimeline()
            }
         }
         request.send(JSON.stringify(params));
      },

      displayTimeline: function() {
         var self = this
         var container = document.getElementById('timeline-view');
         container.innerHTML = ""

         // Configuration for the Timeline
         var options = {};
         console.log(self.timeline_dataset)

         var items = new vis.DataSet(self.timeline_dataset)
         // Create a Timeline
         var timeline = new vis.Timeline(container, items, options);
      }
   }
});