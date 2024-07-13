$(document).ready(function() {
    $('input[name="hasChildren"]').change(function() {
		if ($(this).val() === 'yes') {
			$('#childrenDetails').removeClass('hidden');
		} else {
			$('#childrenDetails').addClass('hidden');
		}
	});

	$('input[name="work"]').change(function() {
		if ($(this).val() === 'yes') {
			$('#workDetails').removeClass('hidden');
		} else {
			$('#workDetails').addClass('hidden');
		}
	});

	$('input[name="exercise"]').change(function() {
		if ($(this).val() === 'yes') {
			$('#exerciseDetails').removeClass('hidden');
		} else {
			$('#exerciseDetails').addClass('hidden');
		}
	});

	$('input[name="chores"]').change(function() {
		if ($(this).val() === 'yes') {
			$('#choresDetails').removeClass('hidden');
		} else {
			$('#choresDetails').addClass('hidden');
		}
	});

	$('input[name="cook"]').change(function() {
		if ($(this).val() === 'yes') {
			$('#cookDetails').removeClass('hidden');
		} else {
			$('#cookDetails').addClass('hidden');
		}
	});

	$('input[name="commute"]').change(function() {
		if ($(this).val() === 'yes') {
			$('#commuteDetails').removeClass('hidden');
		} else {
			$('#commuteDetails').addClass('hidden');
		}
	});

	$('input[name="leisure"]').change(function() {
		if ($(this).val() === 'yes') {
			$('#leisureDetails').removeClass('hidden');
		} else {
			$('#leisureDetails').addClass('hidden');
		}
	});

	$('input[name="social"]').change(function() {
		if ($(this).val() === 'yes') {
			$('#socialDetails').removeClass('hidden');
		} else {
			$('#socialDetails').addClass('hidden');
		}
	});

	$('input[name="errands"]').change(function() {
		if ($(this).val() === 'yes') {
			$('#errandDetails').removeClass('hidden');
		} else {
			$('#errandDetails').addClass('hidden');
		}
	});

	
	$("#yesbtn").on( "click", function() {
		$("#questionnaireForm").show();
		$("#notice").hide();
		
	});
	
});

function processQuestionnaire() {
    const formData = $('#questionnaireForm').serializeArray();
    const userPreferences = {};
    formData.forEach(item => {
        userPreferences[item.name] = item.value;
    });

    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    window.location.href = 'stats.html'; // Redirect to the main page
}
