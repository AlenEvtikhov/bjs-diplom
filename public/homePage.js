'use strict';

//Выход
const logout = new LogoutButton();
logout.action = exit => ApiConnector.logout(response => {
	if (response.success) {
		location.reload();
	}
});

//Инфо о пользователе
ApiConnector.current(current => {
	if (current.success) {
		ProfileWidget.showProfile(current.data);
	}
});

//Инфо о курсах валют
const rates = new RatesBoard();

function ratesUpdate() {
	ApiConnector.getStocks(response => {
		if (response.success) {
			rates.clearTable();
			rates.fillTable(response.data);
		}
		return;
	});
}
ratesUpdate();
setInterval(ratesUpdate, 60000);

//Операции с деньгами

//Пополнение баланса

const money = new MoneyManager();
money.addMoneyCallback = credit => ApiConnector.addMoney(credit, response => {
	if (response.success) {
		ProfileWidget.showProfile(response.data);
		return money.setMessage(true, 'Вы успешно пополнили счет на' + credit.currency + credit.amount);
	}
	return money.setMessage(false, 'Ошибка: ' + response.error);
});


//Конвертация
money.conversionMoneyCallback = exchange => ApiConnector.convertMoney(exchange, response => {
	if (response.success) {
		ProfileWidget.showProfile(response.data);
		return money.setMessage(true, 'Вы успешно конвертировали сумму ' + exchange.fromCurrency + exchange.fromAmount);
	}
	return money.setMessage(false, 'Ошибка: ' + response.error);
});


//Перевод
money.sendMoneyCallback = debit => ApiConnector.transferMoney(debit, response => {
	if (response.success) {
		ProfileWidget.showProfile(response.data);
		return money.setMessage(true, 'Вы успешно перевели сумму ' + debit.currency + debit.amount + ' получателю ' + debit.to);
	}
	return money.setMessage(false, 'Ошибка: ' + response.error);
});

//Запрос списка избранного
const favorite = new FavoritesWidget();
ApiConnector.getFavorites(response => {
	if (response.success) {
		favorite.clearTable();
		favorite.fillTable(response.data);
		money.updateUsersList(response.data);
	}
});

//Добавление пользователя
favorite.addUserCallback = addUser => ApiConnector.addUserToFavorites(addUser, response => {
	if (response.success) {
		favorite.clearTable();
		favorite.fillTable(response.data);
		money.updateUsersList(response.data);
		return favorite.setMessage(true, 'Добавлен новый пользователь #' + addUser.id + ': ' + addUser.name);
	}
	return favorite.setMessage(false, 'Ошибка: ' + response.error);
});
//Удаление пользователя
favorite.removeUserCallback = deletedUser => ApiConnector.removeUserFromFavorites(deletedUser, response => {
	if (response.success) {
		favorite.clearTable();
		favorite.fillTable(response.data);
		money.updateUsersList(response.data);
		return favorite.setMessage(true, 'Пользователь ' + deletedUser + ' удален');
	}
	return favorite.setMessage(false, 'Ошибка: ' + response.error);
});