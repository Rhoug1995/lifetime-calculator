$(document).ready(function() {
    
	$('#showGraphs').prop("checked", true);

    $('#showGraphs').change(function() {
        $('#charts').toggle();
    });

    const taskTable = document.getElementById('taskTable');
    taskTable.addEventListener('input', calculateTime);

    document.getElementById('addTask').addEventListener('click', () => {
        addTaskRow();
    });

    function addTaskRow(task = {}) {
        const newRow = taskTable.querySelector('tbody').insertRow(-1);
        newRow.innerHTML = `
            <td><input type="text" name="taskName" class="form-control" placeholder="Task name" value="${task.taskName || ''}"></td>
            <td><input type="number" name="recurrenceAmount" class="form-control" placeholder=0 value="${task.recurrenceAmount || 0}"></td>
            <td>
                <select name="recurrence" class="form-select">
                    <option value="hourly" ${task.recurrence === 'hourly' ? 'selected' : ''}>Hourly</option>
                    <option value="daily" ${!task.recurrence || task.recurrence === 'daily' ? 'selected' : ''}>Daily</option>
                    <option value="weekly" ${task.recurrence === 'weekly' ? 'selected' : ''}>Weekly</option>
                    <option value="monthly" ${task.recurrence === 'monthly' ? 'selected' : ''}>Monthly</option>
                </select>
            </td>
            <td><input type="number" name="durationAmount" class="form-control" placeholder=0 value="${task.durationAmount || 0}"></td>
            <td>
                <select name="durationUnit" class="form-select">
                    <option value="seconds" ${task.durationUnit === 'seconds' ? 'selected' : ''}>Seconds</option>
                    <option value="minutes" ${!task.durationUnit || task.durationUnit === 'minutes' ? 'selected' : ''}>Minutes</option>
                    <option value="hours" ${task.durationUnit === 'hours' ? 'selected' : ''}>Hours</option>
                </select>
            </td>
            <td>
                <button class="btn btn-info showStats">Stats</button>
                <input type="hidden" class="dailyStats">
                <input type="hidden" class="weeklyStats">
                <input type="hidden" class="monthlyStats">
                <input type="hidden" class="yearlyStats">
                <input type="hidden" class="lifetimeStats">
            <button class="btn btn-danger deleteTask">Delete</button></td>
        `;
        newRow.querySelector('.deleteTask').addEventListener('click', () => {
            newRow.remove();
            calculateTime();
        });
        newRow.querySelector('.showStats').addEventListener('click', () => {
            showStatsModal(newRow);
        });
        calculateTime();
    }

    document.querySelectorAll('.deleteTask').forEach(button => {
        button.addEventListener('click', () => {
            button.parentElement.parentElement.remove();
            calculateTime();
        });
    });

    function calculateTime() {
        const lifeExpectancy = parseInt($('#lifeExpectancy').val()) || 0;
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

            // Store calculated stats in hidden fields
            $(this).find('.dailyStats').val(dailyMinutes.toFixed(2));
            $(this).find('.weeklyStats').val(weeklyMinutes.toFixed(2));
            $(this).find('.monthlyStats').val(monthlyMinutes.toFixed(2));
            $(this).find('.yearlyStats').val(yearlyMinutes.toFixed(2));
            $(this).find('.lifetimeStats').val(lifetimeMinutes.toFixed(2));
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
        updateBarChart(taskDurations);
    }

    function showStatsModal(row) {
		
        const lifeExpectancy = parseInt($('#lifeExpectancy').val()) || 0;
		
        const taskName = $(row).find('input[name="taskName"]').val();
        const daily = $(row).find('.dailyStats').val();
        const weekly = $(row).find('.weeklyStats').val();
        const monthly = $(row).find('.monthlyStats').val();
        const yearly = $(row).find('.yearlyStats').val();
        const lifetime = $(row).find('.lifetimeStats').val();

		$('#statsModalLabel').html(taskName + ' - Advanced statistics');
        const statsTable = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th></th>
                        <th>Minutes</th>
                        <th>Hours</th>
                        <th>Days</th>
                        <th>Months</th>
                        <th>Years</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="font-weight: bold;">Daily</td>
                        <td>${daily}</td>
                        <td>${(daily / 60).toFixed(2)}</td>
                        <td>${(daily / 60 / 24).toFixed(2)}</td>
                        <td>${(daily / 60 / 24 / 30.44).toFixed(2)}</td>
                        <td>${(daily / 60 / 24 / 365).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Weekly</td>
                        <td>${weekly}</td>
                        <td>${(weekly / 60).toFixed(2)}</td>
                        <td>${(weekly / 60 / 24).toFixed(2)}</td>
                        <td>${(weekly / 60 / 24 / 30.44).toFixed(2)}</td>
                        <td>${(weekly / 60 / 24 / 365).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Monthly</td>
                        <td>${monthly}</td>
                        <td>${(monthly / 60).toFixed(2)}</td>
                        <td>${(monthly / 60 / 24).toFixed(2)}</td>
                        <td>${(monthly / 60 / 24 / 30.44).toFixed(2)}</td>
                        <td>${(monthly / 60 / 24 / 365).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Yearly</td>
                        <td>${yearly}</td>
                        <td>${(yearly / 60).toFixed(2)}</td>
                        <td>${(yearly / 60 / 24).toFixed(2)}</td>
                        <td>${(yearly / 60 / 24 / 30.44).toFixed(2)}</td>
                        <td>${(yearly / 60 / 24 / 365).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold;">Lifetime (${lifeExpectancy} anos)</td>
                        <td>${lifetime}</td>
                        <td>${(lifetime / 60).toFixed(2)}</td>
                        <td>${(lifetime / 60 / 24).toFixed(2)}</td>
                        <td>${(lifetime / 60 / 24 / 30.44).toFixed(2)}</td>
                        <td>${(lifetime / 60 / 24 / 365).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        `;

		calculateTime()
        $('#statsContent').html(statsTable);
        $('#statsModal').modal('show');
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
                            let label = "Occupation during lifetime";
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
                            label += context.raw.toFixed(2) + ' %';
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
                        text: 'Occupation during lifetime (%)'
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
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '000000'.substring(0, 6 - c.length) + c;
    }

    function updatePieChart(taskData) {
        const labels = Object.keys(taskData);
        const data = Object.values(taskData);
        const total = data.reduce((sum, value) => sum + value, 0);
        const percentages = data.map(value => (value / total) * 100);

        pieChart.data.labels = labels;
        pieChart.data.datasets[0].data = percentages;
        pieChart.data.datasets[0].backgroundColor = labels.map(taskName => getColorFromString(taskName));
        pieChart.update();
    }

    function updateBarChart(taskData) {
		// Extract labels and percentages from taskData
		const labels = Object.keys(taskData);
		const data = Object.values(taskData);

		// Calculate total and percentages
		const total = data.reduce((sum, value) => sum + value, 0);
		const percentages = data.map(value => (value / total) * 100);

		// Create an array of objects with label and percentage for sorting
		const dataWithLabels = labels.map((label, index) => ({
			label,
			percentage: percentages[index],
			value: data[index] // If needed, you can also pass the original data values for further reference
		}));

		// Sort dataWithLabels array by percentage in descending order
		dataWithLabels.sort((a, b) => b.percentage - a.percentage);

		// Update durationBarChart with sorted data
		durationBarChart.data.labels = dataWithLabels.map(item => item.label);
		durationBarChart.data.datasets[0].data = dataWithLabels.map(item => item.percentage);
		durationBarChart.data.datasets[0].backgroundColor = dataWithLabels.map(item => getColorFromString(item.label));

		// Update the chart
		durationBarChart.update();
	}


    const predefinedTasks = [
        { taskName: 'Sleeping', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 8, durationUnit: 'hours' },
        { taskName: 'Eating', recurrenceAmount: 3, recurrence: 'daily', durationAmount: 30, durationUnit: 'minutes' },
        { taskName: 'Personal Hygiene', recurrenceAmount: 2, recurrence: 'daily', durationAmount: 15, durationUnit: 'minutes' },
        { taskName: 'Work/School', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 8, durationUnit: 'hours' },
        { taskName: 'Commuting', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 30, durationUnit: 'minutes' },
        { taskName: 'Exercise', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 1, durationUnit: 'hours' },
        { taskName: 'Household Chores', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 1, durationUnit: 'hours' },
        { taskName: 'Leisure/Relaxation', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 2, durationUnit: 'hours' },
        { taskName: 'Social Media/Internet', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 1, durationUnit: 'hours' },
        { taskName: 'Cooking', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 30, durationUnit: 'minutes' },
        { taskName: 'Grocery Shopping', recurrenceAmount: 1, recurrence: 'weekly', durationAmount: 1, durationUnit: 'hours' },
        { taskName: 'Errands', recurrenceAmount: 1, recurrence: 'weekly', durationAmount: 1, durationUnit: 'hours' },
        { taskName: 'Deep Cleaning', recurrenceAmount: 1, recurrence: 'weekly', durationAmount: 2, durationUnit: 'hours' },
        { taskName: 'Laundry', recurrenceAmount: 1, recurrence: 'weekly', durationAmount: 2, durationUnit: 'hours' },
        { taskName: 'Yard Work/Gardening', recurrenceAmount: 1, recurrence: 'weekly', durationAmount: 1, durationUnit: 'hours' },
        { taskName: 'Maintenance', recurrenceAmount: 1, recurrence: 'monthly', durationAmount: 2, durationUnit: 'hours' },
        { taskName: 'Events', recurrenceAmount: 1, recurrence: 'monthly', durationAmount: 4, durationUnit: 'hours' },
        { taskName: 'Education/Skill Development', recurrenceAmount: 1, recurrence: 'monthly', durationAmount: 4, durationUnit: 'hours' },
    ];

    predefinedTasks.forEach(task => addTaskRow(task));
	
	$('#taskTable').DataTable({
        paging: false,
        searching: false,
        info: false,
        ordering: false,
		language: {
            emptyTable: "Add your tasks using the button above."
        }
    });
	
	
});




