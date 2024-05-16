class Factory{
    /* createChart requires a chart type (String) and a list of bet objects 
        - A chart skeleton is created to fill with data from the chart type selected.
        - In the case of a line chart, there can be more bets than labels (dates), so the bets payout array needs to be squished
        - Afterwards, common chart object members need will be appended and the final chart object is returned.
    */
    createChart(type, bets){
        var new_chart = { //Create chart object skeleton
            type: '',
            data: {},
            options: {}
        };

        switch(type) {
            case 'pie':
                new_chart = new PieChart(bets);
                break;
            case 'doughnut':
                new_chart = new DoughnutChart(bets);
                break;
            case 'line':
                new_chart = new LineChart(bets);
                new_chart.data.datasets[0].data = this.assignDataToLabels(bets, new_chart.data.labels); //Reform data to handle multiple bets on same day.
                break;
            default:
                break;
        }

        this.appendCommonMembers(new_chart, type);

        return new_chart;
    }

    appendCommonMembers(chart, type){
        chart.type = type;
        Object.assign(chart, {options: {responsive: true}});
        chart.data.datasets[0].borderWidth = 2;
    }

    /*
        assignDataToLabels takes a list of bets and labels (dates) and matches the array sizes between them.
        - There can be multiple bets on a single day. This function adds payouts of the day up and reduces the array.
    */
    assignDataToLabels(bets, labels){
        var payout_array = [];

        for(var i = 0; i < labels.length; i++){
          payout_array[i] = 0;
        }
        
        for(var i = 0; i < labels.length; i++){
            for(var j = 0; j < bets.length; j++){
                if(bets[j].dateOfGame.toISOString().split('T')[0] == labels[i]){
                    payout_array[i] += Number(bets[j].payout);;
                }
            }
        }

        for(var i = 1; i < labels.length; i++){
            payout_array[i] += payout_array[i-1];
        }

        labels.unshift('start'); //First x-axis label 'start'
        payout_array.unshift(0); //First y-axis label 0

        return payout_array;
    }
}

LineChart = function(bets){
    var data =  {
        datasets: [{
            label: 'Gain Over Time',
            borderColor: ['rgba(0, 255, 0, 0.5)'],
            backgroundColor: ['rgba(0, 240, 0, 0.2)'],
        }]
    };
    data.labels = combineLabels(bets);
    this.data = data;

    function combineLabels(bets){
        var label_array = [];
        var previous_label;
        for(var i = 0; i < bets.length; i++){
            if(previous_label != bets[i].dateOfGame.toString()){
                label_array.push(bets[i].dateOfGame.toISOString().split('T')[0]);
                previous_label = bets[i].dateOfGame.toString();
            }
        }
        return label_array;
    }
}

PieChart = function(bets){
    this.data = generateWinLossData(bets);
}

DoughnutChart = function(bets){
    this.data = generateWinLossData(bets);
}

function generateWinLossData(bets){
    var num_wins = 0;
    var num_losses = 0;
    var num_pushes = 0;
    bets.forEach(bet => {
        if(bet.result == 'win')
            num_wins++;
        else if(bet.result == 'loss')
            num_losses++;
        else
            num_pushes++;
    });
    
    var data =  {
        datasets: [{
            labels: ['Wins', 'Losses', 'Pushes'],
            data: [num_wins, num_losses, num_pushes],
            borderColor: ['rgba(0, 255, 0, 0.5)','rgba(240, 0, 0, 0.5)','rgba(135, 135, 135, 0.5)'],
            backgroundColor: ['rgba(0, 240, 0, 0.2)','rgba(255, 0, 0, 0.2)','rgba(150, 150, 150, 0.2)']
        }]
    };

    return data;
}

module.exports = Factory;