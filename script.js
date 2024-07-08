
$(document).ready(function() {

	/* -------------------------------------------------------------------- Toggles ---------------------------------------------------------------------------- */
	
	const checkboxTexts = ["showStats", "showAdvStats", "showTasks", "showSummary"] 
	checkboxTexts.forEach(id => $('#'+id).prop("checked", true));

    $('#showStats').change(function() {
        $('#stats').toggle();
    });
	
    $('#showAdvStats').change(function() {
        $('#adv_stats').toggle();
    });
	
    $('#showTasks').change(function() {
        $('#tasks').toggle();
        $('#instructions').toggle();
    });
	
	$('#showSummary').change(function() {
        $('#resume').toggle();
    });
	
	$('#interval_impact_description_button').on( "click", function() {
        $('#interval_impact_description').toggle();
    });
	
	$('#time_distribution_across_tasks_description_button').on( "click", function() {
        $('#time_distribution_across_tasks_description').toggle();
    });
	
	$('#recurrence_impact_description_button').on( "click", function() {
        $('#recurrence_impact_description').toggle();
    });
	
	$('#average_time_spent_per_task_description_button').on( "click", function() {
        $('#average_time_spent_per_task_description').toggle();
    });
	
	
});
	
	/* ---------------------------------------------------------------- Calculations -------------------------------------------------------------------------------- */

    const taskTable = document.getElementById('taskTable');
    taskTable.addEventListener('input', calculateTime);

	const lifeExpectancy = document.getElementById('lifeExpectancy');
    lifeExpectancy.addEventListener('input', calculateTime);
    
    function addTaskRow(task = {}) {
    const newRow = taskTable.querySelector('tbody').insertRow(-1);
    newRow.innerHTML = `
        <td><input type="text" name="taskName" class="form-control" placeholder="Task name" value="${task.taskName || ''}"><span>${task.taskDescription || ''}</span></td>
        <td><input type="number" name="recurrenceAmount" min="0" max="1000000" class="form-control" placeholder=0 value="${task.recurrenceAmount || 0}"></td>
        <td>
            <select name="recurrence" class="form-select">
                <option value="hourly" ${task.recurrence === 'hourly' ? 'selected' : ''}>Hourly</option>
                <option value="daily" ${!task.recurrence || task.recurrence === 'daily' ? 'selected' : ''}>Daily</option>
                <option value="weekly" ${task.recurrence === 'weekly' ? 'selected' : ''}>Weekly</option>
                <option value="monthly" ${task.recurrence === 'monthly' ? 'selected' : ''}>Monthly</option>
            </select>
        </td>
        <td><input type="number" name="durationAmount" min="0" max="1000000" class="form-control" placeholder=0 value="${task.durationAmount || 0}"></td>
        <td>
            <select name="durationUnit" class="form-select">
                <option value="seconds" ${task.durationUnit === 'seconds' ? 'selected' : ''}>Seconds</option>
                <option value="minutes" ${!task.durationUnit || task.durationUnit === 'minutes' ? 'selected' : ''}>Minutes</option>
                <option value="hours" ${task.durationUnit === 'hours' ? 'selected' : ''}>Hours</option>
            </select>
        </td>
        <td><input type="number" name="intervalDuration" id="intervalDuration_${task.taskName}" min="0" max="1000000" class="form-control" placeholder="0" value="${task.intervalDuration || 0}"></td>
        <td>
            <select name="intervalUnit" class="form-select" onchange="toggleIntervalDuration(this, 'intervalDuration_${task.taskName}')">
                <option value="hours" ${task.intervalUnit === 'hours' ? 'selected' : ''}>Hours</option>
                <option value="days" ${!task.intervalUnit || task.intervalUnit === 'days' ? 'selected' : ''}>Days</option>
                <option value="weeks" ${task.intervalUnit === 'weeks' ? 'selected' : ''}>Weeks</option>
                <option value="months" ${task.intervalUnit === 'months' ? 'selected' : ''}>Months</option>
                <option value="years" ${task.intervalUnit === 'years' ? 'selected' : ''}>Years</option>
                <option value="lifetime" ${task.intervalUnit === 'lifetime' ? 'selected' : ''}>Lifetime</option>
            </select>
        </td>
        <td>
            <button class="btn btn-info showStats"><i class="fa fa-bar-chart" aria-hidden="true"></i></button>
            <input type="hidden" class="dailyStats">
            <input type="hidden" class="weeklyStats">
            <input type="hidden" class="monthlyStats">
            <input type="hidden" class="yearlyStats">
            <input type="hidden" class="lifetimeStats">
            <button class="btn btn-danger deleteTask"><i class="fa fa-times" aria-hidden="true"></i></button>
        </td>
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


	document.getElementById('taskFilter').addEventListener('input', function() {
		const filterValue = this.value.toLowerCase();
		const rows = taskTable.querySelectorAll('tbody tr');

		rows.forEach(row => {
			const taskName = row.querySelector('input[name="taskName"]').value.toLowerCase();
			if (taskName.includes(filterValue)) {
				row.style.display = '';
			} else {
				row.style.display = 'none';
			}
		});
	});

	
	document.getElementById('addTask').addEventListener('click', () => {
        addTaskRow();
    });

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
            const intervalDuration = parseFloat($(this).find('input[name="intervalDuration"]').val()) || 0;
            const intervalUnit = $(this).find('select[name="intervalUnit"]').val();

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
            
            let intervalInYears = intervalDuration;
            if (intervalUnit === 'hours') intervalInYears = intervalDuration / 24 / 365;
            else if (intervalUnit === 'days') intervalInYears = intervalDuration / 365;
            else if (intervalUnit === 'weeks') intervalInYears = intervalDuration / 52;
            else if (intervalUnit === 'months') intervalInYears = intervalDuration / 12;
            else if (intervalUnit === 'years') intervalInYears = intervalDuration;
            else if (intervalUnit === 'lifetime') intervalInYears = lifeExpectancy;

            const lifetimeMinutes = yearlyMinutes * intervalInYears;

            totalMinutes += lifetimeMinutes;
            totalDaily += dailyMinutes;
            totalWeekly += weeklyMinutes;
            totalMonthly += monthlyMinutes;
            totalYearly += yearlyMinutes;

            taskData[taskName] = (taskData[taskName] || 0) + lifetimeMinutes;
            taskDurations[taskName] = (taskDurations[taskName] || 0) + (dailyMinutes * intervalInYears * 365 * 60); // Total duration in seconds

            // Store calculated stats in hidden fields
            $(this).find('.dailyStats').val(dailyMinutes.toFixed(2));
            $(this).find('.weeklyStats').val(weeklyMinutes.toFixed(2));
            $(this).find('.monthlyStats').val(monthlyMinutes.toFixed(2));
            $(this).find('.yearlyStats').val(yearlyMinutes.toFixed(2));
            $(this).find('.lifetimeStats').val(lifetimeMinutes.toFixed(2));
        });

        
        const minutesLeft = (totalLifetimeMinutes - totalMinutes);
        const hoursLeft = minutesLeft / 60;
        const daysLeft = hoursLeft / 24;
        const weeksLeft = daysLeft / 7;
        const monthsLeft = daysLeft / 30.44;
        const yearsLeft = daysLeft / 365;
		
		if(hoursLeft <= 0){
			$('#timeRemaining').css('color', 'red');
		} else {
			$('#timeRemaining').css('color', 'black');
		}
        $('#hoursLeft').text(`${hoursLeft.toFixed(2)} hours`);
        $('#daysLeft').text(`${daysLeft.toFixed(2)} days`);
        $('#weeksLeft').text(`${weeksLeft.toFixed(2)} weeks`);
        $('#monthsLeft').text(`${monthsLeft.toFixed(2)} months`);
        $('#yearsLeft').text(`${yearsLeft.toFixed(2)} years`);
		
        updatePieChart(taskData);
        updateBarChart(taskDurations);
		
		 // Calculate average time per task
		const taskCount = $('#taskTable tbody tr').length;
		const averageDaily = taskCount > 0 ? totalDaily / taskCount : 0;
		const averageWeekly = taskCount > 0 ? totalWeekly / taskCount : 0;
		const averageMonthly = taskCount > 0 ? totalMonthly / taskCount : 0;
		const averageYearly = taskCount > 0 ? totalYearly / taskCount : 0;

		$('#averageDaily').val(averageDaily.toFixed(2));
		$('#averageWeekly').val(averageWeekly.toFixed(2));
		$('#averageMonthly').val(averageMonthly.toFixed(2));
		$('#averageYearly').val(averageYearly.toFixed(2));

		// Store task distribution, interval and recurrence impacts in hidden inputs
		let taskDistribution = '';
		let intervalImpact = '';
		let recurrenceImpact = '';
		for (const [taskName, lifetimeMinutes] of Object.entries(taskData)) {
			const percentage = (lifetimeMinutes / totalMinutes) * 100;
			taskDistribution += `<tr><td>${taskName}</td><td>${percentage.toFixed(2)}%</td></tr>`;
			intervalImpact += `<tr><td>${taskName}</td><td>${(taskDurations[taskName] / totalLifetimeMinutes * 100).toFixed(2)}%</td></tr>`;
			recurrenceImpact += `<tr><td>${taskName}</td><td>${(taskDurations[taskName] / totalMinutes * 100).toFixed(2)}%</td></tr>`;
		}

		$('#taskDistributionContent').val(taskDistribution);
		$('#intervalImpactContent').val(intervalImpact);
		$('#recurrenceImpactContent').val(recurrenceImpact);
		
		/*
		console.log("remaining: " + minutesLeft);
		displaySuggestedTasks(minutesLeft);
		*/
		
		 // Update aggregate statistics display
		$('#aggregateStats').html(`
			<div class="row mb-4">
				<div class="col-3">
					<h3 class="mb-4">
						Time Distribution Across Tasks 
						<button id="time_distribution_across_tasks_description_button" class="btn btn-sm btn- "><i class="fa fa-question-circle" aria-hidden="true"></i></button>
					</h3>
					
					<div id="time_distribution_across_tasks_description" style="display:none">
						<p>Time Distribution Across Tasks measures the percentage of your total time spent on each individual task relative to the total time spent on all tasks. This helps to understand how much of your total time is dedicated to each specific task.</p>
						<p>For example, if you spend a total of 2,000 minutes on various tasks and 500 minutes of that time is spent on exercising, the Time Distribution Across Tasks for exercising would be (500 / 2,000) * 100 = 25%.</p>
					</div>
					
					<table id="time_distribution_across_tasks" class="table table-striped">
						<thead><tr><th>Task Name</th><th>Percentage of Total Time</th></tr></thead>
						<tbody>${taskDistribution}</tbody>
					</table>
				</div>

				<div class="col-3">
					<h3 class="mb-4">
						Interval Impact
						<button id="interval_impact_description_button" class="btn btn-sm btn- "><i class="fa fa-question-circle" aria-hidden="true"></i></button>
					</h3>
					
					<div id="interval_impact_description" style="display:none">
						<p>Interval Impact measures the percentage of your total lifetime spent on a task within the defined interval of years during which the task is performed. This helps to understand how a task's time commitment is distributed across the different phases of your life.</p>
						<p>For example, if you spend 2 hours a week studying for 4 years during college (ages 18 to 22), the Interval Impact would show the percentage of those 4 years spent on studying in relation to your total life expectancy.</p>
					</div>
						
					<table id="interval_impact" class="table table-striped">
						<thead><tr><th>Task Name</th><th>Interval Impact</th></tr></thead>
						<tbody>${intervalImpact}</tbody>
					</table>
				</div>

				<div class="col-3">
					<h3 class="mb-4">
						Recurrence Impact
						<button id="recurrence_impact_description_button" class="btn btn-sm btn- "><i class="fa fa-question-circle" aria-hidden="true"></i></button>
					</h3>
					
					<div id="recurrence_impact_description" style="display:none">
						<p>Recurrence Impact indicates the percentage of your total lifetime spent on recurring tasks based on their frequency. It helps to understand how much of your life is consumed by tasks that are performed regularly (daily, weekly, monthly, etc.).</p>
						<p>For example, if you brush your teeth twice a day for 5 minutes each time throughout your entire life, the Recurrence Impact would show the percentage of your total life spent on brushing teeth.</p>
					</div>
						
					<table id="recurrence_impact" class="table table-striped">
						<thead><tr><th>Task Name</th><th>Recurrence Impact</th></tr></thead>
						<tbody>${recurrenceImpact}</tbody>
					</table>
				</div>
				
				<div class="col-3">
					<!-- Aggregate stats will be injected here by JavaScript -->
					<h3 class="mb-4">
						Average Time Spent Per Task
						<button id="average_time_spent_per_task_description_button" class="btn btn-sm btn- "><i class="fa fa-question-circle" aria-hidden="true"></i></button>
					</h3>
					
					<div id="average_time_spent_per_task_description" style="display:none">
						<p>Average Time Spent Per Task measures the average amount of time you dedicate to each task over the span of your life. This metric helps to highlight the individual time investment for each task, providing insight into which activities consume more of your time on a regular basis.</p>
						<p>For example, if you spend 30 minutes cooking every day, the Average Time Spent Per Task will show the average daily time you spend on cooking, aggregated over your entire lifespan. This allows you to see the time commitment required for each task, aiding in better time management and prioritization.</p>
					</div>
					
					<table id="average_time_spent_per_task" class="table table-striped">
						<thead><tr><th>Task Name</th><th>Duration</th></tr></thead>
						<tbody>
						<tr>
							<td>Daily</td>
							<td>${averageDaily.toFixed(2)} minutes</td>
						</tr>
						<tr>
							<td>Weekly</td>
							<td>${averageWeekly.toFixed(2)} minutes</td>
						</tr>
						<tr>
							<td>Monthly</td>
							<td>${averageMonthly.toFixed(2)} minutes</td>
						</tr>
						<tr>
							<td>Yearly</td>
							<td>${averageYearly.toFixed(2)} minutes</td>
						</tr>
						</tbody>
					</table>
				</div>
			</div>
		`);
		
		datatables()
		
    }
	
	function toggleIntervalDuration(selectElement, intervalDurationTaskName) {
		const intervalDurationInput = document.getElementById(intervalDurationTaskName);
		if (selectElement.value === 'lifetime') {
			intervalDurationInput.disabled = true;
			intervalDurationInput.value = 1;
			intervalDurationInput.style.backgroundColor = '#e9ecef'; // Bootstrap's gray background color for disabled elements
		} else {
			intervalDurationInput.disabled = false;
			intervalDurationInput.style.backgroundColor = ''; // Reset to default
		}
	}


	function datatables(){
		$('#time_distribution_across_tasks').DataTable({
			paging: false,
			searching: false,
			info: false,
			ordering: true,
			order: [[1, 'desc']]
		});
				
		$('#recurrence_impact').DataTable({
			paging: false,
			searching: false,
			info: false,
			ordering: true,
			order: [[1, 'desc']]
		});
		
		$('#interval_impact').DataTable({
			paging: false,
			searching: false,
			info: false,
			ordering: true,
			order: [[1, 'desc']]
		});
	}
	

    function showStatsModal(row) {
		
        const lifeExpectancy = parseInt($('#lifeExpectancy').val()) || 0;
		
        const taskName = $(row).find('input[name="taskName"]').val();
        const daily = $(row).find('.dailyStats').val();
        const weekly = $(row).find('.weeklyStats').val();
        const monthly = $(row).find('.monthlyStats').val();
        const yearly = $(row).find('.yearlyStats').val();
        const lifetime = $(row).find('.lifetimeStats').val();
		
		
		const dailyStats = $(row).find('.dailyStats').val();
		const weeklyStats = $(row).find('.weeklyStats').val();
		const monthlyStats = $(row).find('.monthlyStats').val();
		const yearlyStats = $(row).find('.yearlyStats').val();
		const lifetimeStats = $(row).find('.lifetimeStats').val();
		const taskImpactStats = $(row).find('.taskImpactStats').val();
	

		$('#statsModalLabel').html(taskName + ' - Advanced statistics');
        const statsTable = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Time spent</th>
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
	
	/* ---------------------------------------------------------------------- default tasks -------------------------------------------------------------------------- */
    
	const healthyTasks = [
		{ taskName: 'Sleeping', durationAmount: 480, durationUnit: 'minutes' }, // 8 hours converted to minutes
		{ taskName: 'Eating', durationAmount: 30, durationUnit: 'minutes' },
		{ taskName: 'Personal Hygiene', durationAmount: 15, durationUnit: 'minutes' },
		{ taskName: 'Workout', durationAmount: 10, durationUnit: 'minutes' },
		{ taskName: 'Visit a Museum', durationAmount: 50, durationUnit: 'minutes' },
		// Add more tasks as needed
	];
	
	const predefinedTasks = [
        { taskName: 'Sleeping', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 8, durationUnit: 'hours', intervalDuration: 1, intervalUnit: "lifetime", taskDescription: "" },
        { taskName: 'Eating', recurrenceAmount: 3, recurrence: 'daily', durationAmount: 30, durationUnit: 'minutes', intervalDuration: 1, intervalUnit: "lifetime", taskDescription: "" },
        { taskName: 'Personal Hygiene', recurrenceAmount: 2, recurrence: 'daily', durationAmount: 15, durationUnit: 'minutes', intervalDuration: 1, intervalUnit: "lifetime", taskDescription: "" },
        { taskName: 'Commuting', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 30, durationUnit: 'minutes', intervalDuration: 50, intervalUnit: "years", taskDescription: "" },
        { taskName: 'Exercise', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 1, durationUnit: 'hours', intervalDuration: 40, intervalUnit: "years", taskDescription: "" },
        { taskName: 'Household Chores', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 1, durationUnit: 'hours', intervalDuration: 60, intervalUnit: "years", taskDescription: "" },
        { taskName: 'Leisure/Relaxation', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 2, durationUnit: 'hours', intervalDuration: 60, intervalUnit: "years", taskDescription: "" },
        { taskName: 'Social Media/Internet', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 1, durationUnit: 'hours', intervalDuration: 40, intervalUnit: "years", taskDescription: "" },
        { taskName: 'Cooking', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 30, durationUnit: 'minutes', intervalDuration: 70, intervalUnit: "years", taskDescription: "" },
        { taskName: 'Grocery Shopping', recurrenceAmount: 1, recurrence: 'weekly', durationAmount: 1, durationUnit: 'hours', intervalDuration: 70, intervalUnit: "years", taskDescription: "" },
        { taskName: 'Deep Cleaning', recurrenceAmount: 1, recurrence: 'weekly', durationAmount: 2, durationUnit: 'hours', intervalDuration: 60, intervalUnit: "years", taskDescription: "" },
        { taskName: 'Laundry', recurrenceAmount: 1, recurrence: 'weekly', durationAmount: 2, durationUnit: 'hours', intervalDuration: 70, intervalUnit: "years", taskDescription: "" },
        { taskName: 'Yard Work/Gardening', recurrenceAmount: 1, recurrence: 'weekly', durationAmount: 1, durationUnit: 'hours', intervalDuration: 40, intervalUnit: "years", taskDescription: "" },
        { taskName: 'Events', recurrenceAmount: 1, recurrence: 'monthly', durationAmount: 4, durationUnit: 'hours', intervalDuration: 40, intervalUnit: "years" },
        { taskName: 'Education/Skill Development', recurrenceAmount: 1, recurrence: 'monthly', durationAmount: 4, durationUnit: 'hours', intervalDuration: 40, intervalUnit: "years", taskDescription: "" },
    ];

    predefinedTasks.forEach(task => addTaskRow(task));
	
	
	/* --------------------------------------------------------------------------- auto tasks from questionaire --------------------------------------------------------------------- */
	
	const userPreferences = JSON.parse(localStorage.getItem('userPreferences'));
	
	const questionaireTasks = {
		"0": { taskName: 'Change diapers', recurrenceAmount: 5, recurrence: 'daily', durationAmount: 10, durationUnit: 'minutes', intervalDuration: 2, intervalUnit: "years", taskDescription: "" },
		"1": { taskName: 'Feed the baby', recurrenceAmount: 5, recurrence: 'daily', durationAmount: 30, durationUnit: 'minutes', intervalDuration: 2, intervalUnit: "years", taskDescription: "" },
		"2": { taskName: 'Make school lunch', recurrenceAmount: 1, recurrence: 'daily', durationAmount: 20, durationUnit: 'minutes', intervalDuration: 10, intervalUnit: "years", taskDescription: "" },
		"3": { taskName: 'Work', recurrenceAmount: 1, recurrence: 'daily', durationAmount: userPreferences.workHours, durationUnit: 'hours', intervalDuration: 50, intervalUnit: "years", taskDescription: "" }
	}
	
	if (userPreferences) {
        if (userPreferences.hasChildren === 'yes') {
            if (userPreferences.newborn > 0) {
				addTaskRow(questionaireTasks["0"]);
				addTaskRow(questionaireTasks["1"]);
            }
            if (userPreferences.teenager > 0) {
				addTaskRow(questionaireTasks["2"]);
            }
        }
        if (userPreferences.work === 'yes') {
			addTaskRow(questionaireTasks["3"]);
        }
		
    }


	/* ------------------------------------------------------------------------------------------------------------------------------------------------ */
	
	
	/*	
	function suggestHealthyTasks(remainingTime) {
		let suggestions = [];
		let totalTime = 0;

		// Sort tasks by duration to try shorter tasks first
		const sortedTasks = healthyTasks.sort((a, b) => a.durationAmount - b.durationAmount);

		for (let task of sortedTasks) {
			if (totalTime + task.durationAmount <= remainingTime) {
				suggestions.push(task);
				totalTime += task.durationAmount;
			}
		}

		return suggestions;
	}


	function displaySuggestedTasks(remainingTime) {
		const suggestions = suggestHealthyTasks(remainingTime);
		const suggestionList = document.getElementById('suggestionList');
		suggestionList.innerHTML = ''; // Clear previous suggestions

		suggestions.forEach(task => {
			const listItem = document.createElement('li');
			listItem.textContent = `${task.taskName}: ${task.durationAmount} ${task.durationUnit}`;
			suggestionList.appendChild(listItem);
		});
	}
	*/


	/* ------------------------------------------------------------------------------------------------------------------------------------------------ */

	
	$('#taskTable').DataTable({
        paging: false,
        searching: false,
        info: false,
        ordering: false,
		language: {
            emptyTable: "Add your tasks using the button above."
        }
    });
	
	calculateTime();
	
	
	
	
	
	
	




