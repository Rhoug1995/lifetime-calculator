$(document).ready(function() {
    $('#taskTable').DataTable({
        paging: false,
        searching: false,
        info: false,
        ordering: false
    });

    $('#showStats').prop("checked", true);
	$('#showGraphs').prop("checked", true);

    $('#showStats').change(function() {
        var columnsToToggle = [5, 6, 7, 8, 9];
        $.each(columnsToToggle, function(index, columnIndex) {
            $('#taskTable').find('tr').each(function() {
                $(this).find('th, td').eq(columnIndex).toggle();
            });
        });
    });
	
	$('#showGraphs').change(function() {
		$('#charts').toggle();
    });

    const taskTable = document.getElementById('taskTable');
    taskTable.addEventListener('input', calculateTime);

    document.getElementById('addTask').addEventListener('click', () => {
        const newRow = taskTable.querySelector('tbody').insertRow(-1);
        if ($('#showStats').prop("checked")) {
            newRow.innerHTML = `
                <td><input type="text" name="taskName" class="form-control" placeholder="Task name"></td>
                <td><input type="number" name="recurrenceAmount" class="form-control" placeholder=0></td>
                <td>
                    <select name="recurrence" class="form-select">
                        <option value="hourly">Hourly</option>
                        <option value="daily" selected>Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </td>
                <td><input type="number" name="durationAmount" class="form-control" placeholder=0></td>
                <td>
                    <select name="durationUnit" class="form-select">
                        <option value="seconds">Seconds</option>
                        <option value="minutes" selected>Minutes</option>
                        <option value="hours">Hours</option>
                    </select>
                </td>
                <td class="daily"></td>
                <td class="weekly"></td>
                <td class="monthly"></td>
                <td class="yearly"></td>
                <td class="lifetime"></td>
                <td><button class="btn btn-danger deleteTask">Delete</button></td>
            `;
        } else {
            newRow.innerHTML = `
                <td><input type="text" name="taskName" class="form-control" placeholder="Task name"></td>
                <td><input type="number" name="recurrenceAmount" class="form-control" placeholder=0></td>
                <td>
                    <select name="recurrence" class="form-select">
                        <option value="hourly">Hourly</option>
                        <option value="daily" selected>Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </td>
                <td><input type="number" name="durationAmount" class="form-control" placeholder=0></td>
                <td>
                    <select name="durationUnit" class="form-select">
                        <option value="seconds">Seconds</option>
                        <option value="minutes" selected>Minutes</option>
                        <option value="hours">Hours</option>
                    </select>
                </td>
                <td class="daily" style="display: none;"></td>
                <td class="weekly" style="display: none;"></td>
                <td class="monthly" style="display: none;"></td>
                <td class="yearly" style="display: none;"></td>
                <td class="lifetime" style="display: none;"></td>
                <td><button class="btn btn-danger deleteTask">Delete</button></td>
            `;
        }

        newRow.querySelector('.deleteTask').addEventListener('click', () => {
            newRow.remove();
            calculateTime();
        });
        calculateTime();
    });

    document.querySelectorAll('.deleteTask').forEach(button => {
        button.addEventListener('click', () => {
            button.parentElement.parentElement.remove();
            calculateTime();
        });
    });

    function calculateTime() {
        const lifeExpectancy = parseInt(document.getElementById('lifeExpectancy').value) || 0;
        let totalLifetimeMinutes = lifeExpectancy * 365 * 24 * 60;

        let totalMinutes = 0;
        let totalDaily = 0;
        let totalWeekly = 0;
        let totalMonthly = 0;
        let totalYearly = 0;
        let taskData = {};
        let taskDurations = {};

        $('#taskTable tbody tr').each(function() {
            const taskName = $(this).find('input[name="taskName"]').val();
            const recurrenceAmount = parseFloat($(this).find('input[name="recurrenceAmount"]').val()) || 0;
            const recurrenceUnit = $(this).find('select[name="recurrence"]').val();
            const durationAmount = parseFloat($(this).find('input[name="durationAmount"]').val()) || 0;
            const durationUnit = $(this).find('select[name="durationUnit"]').val();

            let durationInMinutes = durationAmount;
            if (durationUnit === 'seconds') durationInMinutes /= 60;
            else if (durationUnit === 'hours') durationInMinutes *= 60;

            let dailyMinutes = 0;
            if (recurrenceUnit === 'daily') dailyMinutes = recurrenceAmount * durationInMinutes;
            else if (recurrenceUnit === 'weekly') dailyMinutes = recurrenceAmount * durationInMinutes / 7;
            else if (recurrenceUnit === 'monthly') dailyMinutes = recurrenceAmount * durationInMinutes / 30.44;
            else if (recurrenceUnit === 'hourly') dailyMinutes = recurrenceAmount * durationInMinutes * 24;

            const weeklyMinutes = dailyMinutes * 7;
            const monthlyMinutes = dailyMinutes * 30.44;
            const yearlyMinutes = dailyMinutes * 365;
            const lifetimeMinutes = yearlyMinutes * lifeExpectancy;

            totalMinutes += lifetimeMinutes;
            totalDaily += dailyMinutes;
            totalWeekly += weeklyMinutes;
            totalMonthly += monthlyMinutes;
            totalYearly += yearlyMinutes;

            taskData[taskName] = (taskData[taskName] || 0) + lifetimeMinutes;
			taskDurations[taskName] = (taskDurations[taskName] || 0) + (dailyMinutes * lifeExpectancy * 60); // Total duration in seconds

            $(this).find('.daily').html(`
                ${dailyMinutes.toFixed(2)} min<br>
				${(dailyMinutes / 60).toFixed(2)} hours<br>
                ${(dailyMinutes / 60 / 24).toFixed(2)} days<br>
                ${(dailyMinutes / 60 / 24 / 30.44).toFixed(2)} months<br>
                ${(dailyMinutes / 60 / 24 / 365).toFixed(2)} years
			`);
				
            $(this).find('.weekly').html(`
                ${weeklyMinutes.toFixed(2)} min<br>
				${(weeklyMinutes / 60).toFixed(2)} hours<br>
                ${(weeklyMinutes / 60 / 24).toFixed(2)} days<br>
                ${(weeklyMinutes / 60 / 24 / 30.44).toFixed(2)} months<br>
                ${(weeklyMinutes / 60 / 24 / 365).toFixed(2)} years
			`);
			
            $(this).find('.monthly').html(`
                ${monthlyMinutes.toFixed(2)} min<br>
				${(monthlyMinutes / 60).toFixed(2)} hours<br>
                ${(monthlyMinutes / 60 / 24).toFixed(2)} days<br>
                ${(monthlyMinutes / 60 / 24 / 30.44).toFixed(2)} months<br>
                ${(monthlyMinutes / 60 / 24 / 365).toFixed(2)} years

			`);
            $(this).find('.yearly').html(`
                ${yearlyMinutes.toFixed(2)} min<br>
				${(yearlyMinutes / 60).toFixed(2)} hours<br>
                ${(yearlyMinutes / 60 / 24).toFixed(2)} days<br>
                ${(yearlyMinutes / 60 / 24 / 30.44).toFixed(2)} months<br>
                ${(yearlyMinutes / 60 / 24 / 365).toFixed(2)} years
			`);
			
            $(this).find('.lifetime').html(`
                ${lifetimeMinutes.toFixed(2)} min<br>
                ${(lifetimeMinutes / 60).toFixed(2)} hours<br>
                ${(lifetimeMinutes / 60 / 24).toFixed(2)} days<br>
                ${(lifetimeMinutes / 60 / 24 / 30.44).toFixed(2)} months<br>
                ${(lifetimeMinutes / 60 / 24 / 365).toFixed(2)} years
            `);
        });

        const hoursLeft = (totalLifetimeMinutes - totalMinutes) / 60;
        const daysLeft = hoursLeft / 24;
        const weeksLeft = daysLeft / 7;
        const monthsLeft = daysLeft / 30.44;
        const yearsLeft = daysLeft / 365;

        $('#hoursLeft').text(`${hoursLeft.toFixed(2)} hours`);
        $('#daysLeft').text(`${daysLeft.toFixed(2)} days`);
        $('#weeksLeft').text(`${weeksLeft.toFixed(2)} weeks`);
        $('#monthsLeft').text(`${monthsLeft.toFixed(2)} months`);
        $('#yearsLeft').text(`${yearsLeft.toFixed(2)} years`);

        updatePieChart(taskData);
        updateBarChart(taskDurations); // Update the bar chart with new data
    }

    const ctx = document.getElementById('taskPieChart').getContext('2d');
    const pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: []
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.raw.toFixed(2) + ' %';
                            return label;
                        }
                    }
                }
            }
        }
    });

	
	const ctx2 = document.getElementById('durationBarChart').getContext('2d');
	const durationBarChart = new Chart(ctx2, {
		type: 'bar',
		data: {
			labels: [],
			datasets: [{
				label: 'Task Durations (seconds)',
				data: [],
				backgroundColor: []
			}]
		},
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: 'top',
				},
				tooltip: {
					callbacks: {
						label: function(context) {
							let label = context.dataset.label || '';
							if (label) {
								label += ': ';
							}
							label += context.raw.toFixed(2) + ' seconds';
							return label;
						}
					}
				}
			},
			scales: {
				y: {
					beginAtZero: true,
					title: {
						display: true,
						text: 'Duration (seconds)'
					}
				}
			}
		}
	});


	function getColorFromString(str) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		const c = (hash & 0x00000000FFFFFF).toString(16).toUpperCase();
		var color = '#' + 'FF'.substring(0, 6 - c.length) + c;
		console.log(color);
		return color;
	}

	// Update Pie Chart with synchronized colors
	function updatePieChart(taskData) {
		const labels = Object.keys(taskData);
		const data = Object.values(taskData);
		const total = data.reduce((sum, value) => sum + value, 0);
		const percentages = data.map(value => (value / total) * 100);

		pieChart.data.labels = labels;
		pieChart.data.datasets[0].data = percentages;
		pieChart.data.datasets[0].backgroundColor = labels.map(taskName => getColorFromString(taskName));
		pieChart.update();

		// Update Bar Chart with synchronized colors
		updateBarChart(taskData);
	}

	// Update Bar Chart with synchronized colors
	function updateBarChart(taskDurations) {
		const aggregatedData = {};
		Object.keys(taskDurations).forEach(taskName => {
			if (aggregatedData[taskName]) {
				aggregatedData[taskName] += taskDurations[taskName];
			} else {
				aggregatedData[taskName] = taskDurations[taskName];
			}
		});

		const labels = Object.keys(aggregatedData);
		const data = Object.values(aggregatedData);

		const combinedData = labels.map((label, index) => ({ label, data: data[index] }));
		combinedData.sort((a, b) => b.data - a.data);

		durationBarChart.data.labels = combinedData.map(item => item.label);
		durationBarChart.data.datasets[0].data = combinedData.map(item => item.data);
		durationBarChart.data.datasets[0].backgroundColor = combinedData.map(item => getColorFromString(item.label));
		durationBarChart.update();
	}





    calculateTime();


    setTimeout(function() {
        $('#showStats').click();
    }, 100); // delay 100 ms

});