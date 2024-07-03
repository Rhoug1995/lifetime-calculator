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
